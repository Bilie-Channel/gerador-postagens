async function gerar() {
  const link = document.getElementById('link').value;
  const valor = document.getElementById('valor').value;
  const cupom = document.getElementById('cupom').value;

  const res = await fetch('/gerar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ link, valor, cupom })
  });

  const data = await res.json();
  document.getElementById('preview').value =
    data.mensagem || 'Erro ao gerar';
}
