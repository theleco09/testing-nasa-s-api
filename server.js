require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/imagens", async (req, res) => {
    try {
        const astro = req.query.astro?.trim();

        if (!astro) {
            return res.status(400).json({
                erro: "Digite o nome de um astro."
            });
        }

        const termos = {
            mars: "Mars planet",
            marte: "Mars planet",
            jupiter: "Jupiter planet",
            saturn: "Saturn planet",
            saturno: "Saturn planet",
            moon: "Earth's Moon",
            lua: "Earth's Moon"
        };
        
        const pesquisa = termos[astro.toLowerCase()] || astro;
        
        const parametros = new URLSearchParams({
            q: pesquisa,
            media_type: "image",
            page_size: "50"
        });

        const url = `https://images-api.nasa.gov/search?${parametros}`;

        const resposta = await fetch(url);

        if (!resposta.ok) {
            console.error("Erro da NASA:", resposta.status);

            return res.status(502).json({
                erro: "A NASA não conseguiu atender à pesquisa."
            });
        }

        const dados = await resposta.json();

        const resultados = dados.collection?.items || [];

        const imagens = resultados
    .filter((item) => {
        const info = item.data?.[0];

        if (!info || !item.links?.length) {
            return false;
        }

        const titulo = (info.title || "").toLowerCase();

        // Prioriza imagens cujo título mencione o astro pesquisado.
        const termosAstros = {
            mars: ["mars", "martian"],
            marte: ["mars", "martian"],
            jupiter: ["jupiter", "jovian"],
            saturn: ["saturn", "saturnian"],
            saturno: ["saturn", "saturnian"],
            moon: ["moon", "lunar"],
            lua: ["moon", "lunar"]
        };

        const termos = termosAstros[astro.toLowerCase()];

        if (termos) {
            return termos.some((termo) => titulo.includes(termo));
        }

        return true;
    })
    .map((item) => {
        const info = item.data[0];

        const linkImagem = item.links.find(
            (link) => link.render === "image"
        );

        if (!linkImagem) {
            return null;
        }

        return {
            titulo: info.title,
            imagem: linkImagem.href,
            data: info.date_created || "",
            descricao: info.description || "Sem descrição disponível.",
            fonte: info.nasa_id
                ? `https://images.nasa.gov/details/${info.nasa_id}`
                : "https://images.nasa.gov/"
        };
    })
    .filter((item) => item !== null);

res.json(imagens);

    } catch (erro) {
        console.error("Erro ao consultar a NASA:", erro);

        res.status(500).json({
            erro: "Não foi possível consultar a NASA. Verifique sua conexão."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});