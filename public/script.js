const campoAstro = document.getElementById("astro");
const botaoPesquisar = document.getElementById("botaoPesquisar");
const mensagem = document.getElementById("mensagem");

const carrossel = document.getElementById("carrossel");
const imagem = document.getElementById("imagem");
const titulo = document.getElementById("titulo");
const data = document.getElementById("data");
const descricao = document.getElementById("descricao");
const fonte = document.getElementById("fonte");

const botaoAnterior = document.getElementById("anterior");
const botaoProximo = document.getElementById("proximo");
const contador = document.getElementById("contador");

function limparHTML(texto) {
    const documento = new DOMParser().parseFromString(
        texto || "",
        "text/html"
    );

    return documento.body.textContent
        .replace(/\s+/g, " ")
        .trim();
}
let imagens = [];
let indiceAtual = 0;

function mostrarImagem() {
    const item = imagens[indiceAtual];

    imagem.src = item.imagem;
    imagem.alt = item.titulo;

    titulo.textContent = item.titulo;
    data.textContent = `Data: ${item.data}`;
    descricao.textContent = limparHTML(
         imagens[indiceAtual].descricao
    );
    fonte.href = item.fonte;

    contador.textContent =
        `Imagem ${indiceAtual + 1} de ${imagens.length}`;

    botaoAnterior.disabled = indiceAtual === 0;
    botaoProximo.disabled = indiceAtual === imagens.length - 1;
}

async function pesquisarImagens() {
    const astro = campoAstro.value.trim();

    if (!astro) {
        mensagem.textContent = "Digite o nome de um astro.";
        carrossel.hidden = true;
        contador.textContent = "";
        return;
    }

    mensagem.textContent = "Buscando imagens na NASA...";
    carrossel.hidden = true;
    contador.textContent = "";
    botaoPesquisar.disabled = true;

    try {
        const resposta = await fetch(
            `/api/imagens?astro=${encodeURIComponent(astro)}`
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(
                dados.erro || "Não foi possível realizar a pesquisa."
            );
        }

        imagens = dados;
        indiceAtual = 0;

        if (imagens.length === 0) {
            mensagem.textContent =
                "Nenhuma imagem encontrada. Tente outro nome de astro.";
            return;
        }

        mensagem.textContent =
            `${imagens.length} imagem(ns) encontrada(s)!`;

        carrossel.hidden = false;

        mostrarImagem();
    } catch (erro) {
        console.error(erro);

        mensagem.textContent =
            erro.message || "Ocorreu um erro ao buscar as imagens.";
    } finally {
        botaoPesquisar.disabled = false;
    }
}

botaoPesquisar.addEventListener("click", pesquisarImagens);

campoAstro.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
        pesquisarImagens();
    }
});

botaoAnterior.addEventListener("click", () => {
    if (indiceAtual > 0) {
        indiceAtual--;
        mostrarImagem();
    }
});

botaoProximo.addEventListener("click", () => {
    if (indiceAtual < imagens.length - 1) {
        indiceAtual++;
        mostrarImagem();
    }
});