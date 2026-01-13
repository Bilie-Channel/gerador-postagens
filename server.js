import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(express.json());

// === Corrige paths ES Modules ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === SERVE O FRONTEND ===
app.use(express.static(path.join(__dirname, 'public')));

// =========================
function detectarLoja(url) {
  if (url.includes('amzn')) return 'AMAZON';
  if (url.includes('mercadolivre')) return 'MERCADO LIVRE';
  if (url.includes('shopee')) return 'SHOPEE';
  return 'LOJA';
}

async function extrairProduto(url) {
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });

  const $ = cheerio.load(response.data);
  const loja = detectarLoja(url);
  let titulo = '';

  if (loja === 'AMAZON')
    titulo = $('#productTitle').text().trim();

  if (loja === 'MERCADO LIVRE')
    titulo = $('h1.ui-pdp-title').text().trim();

  if (loja === 'SHOPEE')
    titulo =
      $('div[data-testid="pdp-product-name"]').text().trim() ||
      $('h1').first().text().trim();

  if (!titulo)
    titulo = $('meta[property="og:title"]').attr('content') || '';

  if (!titulo)
    titulo = $('title').text().trim();

  return { loja, titulo };
}

// === API ===
app.post('/gerar', async (req, res) => {
  const { link, valor, cupom } = req.body;

  try {
    const { loja, titulo } = await extrairProduto(link);

    const frases = [
      '🤣 Promoção que não espera você pensar',
      '🤣 Corre antes que o estoque suma',
      '🤣 Preço bom não dura',
      '🤣 Daqueles achados que somem rápido'
    ];

    const frase = frases[Math.floor(Math.random() * frases.length)];

    const mensagem = `
🟠 ${loja}

${frase}

📦 ${titulo}
💲 Valor: ${valor || ''}
🎟️ Cupom: ${cupom || 'preço no anúncio'}
👉 Compre aqui: ${link}
`.trim();

    await axios.post(
      `https://api.telegram.org/bot${process.env.BOT_TOKEN}/sendMessage`,
      {
        chat_id: process.env.CHAT_ID,
        text: mensagem
      }
    );

    res.json({ mensagem });

  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao gerar postagem' });
  }
});

// === START ===
app.listen(3000, () => {
  console.log('✅ Acesse: http://localhost:3000');
});
