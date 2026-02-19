import express from 'express';
import cors from 'cors';
import * as mediasoup from 'mediasoup';

const app = express();
app.use(cors());
app.use(express.json());

let worker;
let router;

// socket 없이 HTTP로 요청 받는 구조 (시그널링 서버가 프록시 역할)
const peers = new Map(); // peerId -> { transports: [], producers: [] }

async function initMediasoup() {
  worker = await mediasoup.createWorker({
    rtcMinPort: 40000,
    rtcMaxPort: 49999,
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp']
  });

  router = await worker.createRouter({
    mediaCodecs: [
      { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
      { kind: 'video', mimeType: 'video/VP8', clockRate: 90000, parameters: {} }
    ]
  });

  console.log('Mediasoup SFU 서버 준비 완료');
}

await initMediasoup();

// 1. RTP Capabilities 반환
app.get('/rtp-capabilities', (req, res) => {
  res.json(router.rtpCapabilities);
});

// 2. WebRTC Transport 생성
app.post('/create-web-rtc-transport', async (req, res) => {
  try {
    const { peerId } = req.body;

    // mediasoup가 서버 쪽 WebRtcTransport 객체를 생성
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }], // 서버에 올릴 때는 공인 IP 혹은 로드밸런서 IP를 넣어야함
      enableUdp: true,
      enableTcp: true,
      preferUdp: true
    });

    if (!peers.has(peerId)) peers.set(peerId, { transports: [], producers: [] });
    peers.get(peerId).transports.push(transport);

    res.json({
      id: transport.id, // SFU 서버 transport 식별자
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// 3. Transport 연결 (DTLS)
app.post('/connect-transport', async (req, res) => {
  try {
    const { transportId, dtlsParameters, peerId } = req.body;
    const transport = peers.get(peerId).transports.find(t => t.id === transportId);
    await transport.connect({ dtlsParameters });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Produce 생성
app.post('/produce', async (req, res) => {
  try {
    const { transportId, kind, rtpParameters, peerId } = req.body;
    const transport = peers.get(peerId).transports.find(t => t.id === transportId);
    const producer = await transport.produce({ kind, rtpParameters });
    peers.get(peerId).producers.push(producer);
    res.json({ id: producer.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Consume 생성
app.post('/consume', async (req, res) => {
  try {
    const { transportId, producerId, kind, peerId } = req.body;
    const transport = peers.get(peerId).transports.find(t => t.id === transportId);
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities: router.rtpCapabilities,
      paused: false
    });
    res.json({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/peer-producers', (req, res) => {
  const { peerId } = req.query;
  const peerData = peers.get(peerId);
  if (!peerData) return res.json(null);

  // peerId + producers 배열 반환
  res.json({
    peerId,
    producers: peerData.producers.map(p => ({ id: p.id, kind: p.kind }))
  });
});



app.listen(3001, () => console.log('SFU 서버 시작: http://localhost:3001'));
