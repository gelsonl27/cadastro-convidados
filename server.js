// server.js - Arquivo principal do servidor Node.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_convidados'
});

// Conectar ao banco de dados
db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
        return;
    }
    console.log('Conectado ao MySQL');

    // Criar banco de dados se não existir
    db.query(`CREATE DATABASE IF NOT EXISTS sistema_convidados`, (err) => {
        if (err) throw err;

        // Usar o banco de dados
        db.query(`USE sistema_convidados`, (err) => {
            if (err) throw err;

            // Criar tabela de convidados
            const sqlCreateTable = `
            CREATE TABLE IF NOT EXISTS convidados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome_morador VARCHAR(255) NOT NULL,
                numero_salao VARCHAR(50) NOT NULL,
                nome_convidado VARCHAR(255) NOT NULL,
                rg VARCHAR(20) NOT NULL,
                placa_veiculo VARCHAR(10),
                ano_veiculo VARCHAR(4),
                modelo_veiculo VARCHAR(100),
                cor_veiculo VARCHAR(50),
                data_evento DATE NOT NULL,
                data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `;

            db.query(sqlCreateTable, (err) => {
                if (err) throw err;
                console.log('Tabela de convidados criada ou já existente')
            });
        });
    });
});

// Rotas API
app.post('/api/convidados', (req, res) => {
    const {
        nomeMorador,
        numeroSalao,
        nomeConvidado,
        rgConvidado,
        placaVeiculo,
        anoVeiculo,
        modeloVeiculo,
        corVeiculo,
        dataEvento
    } = req.body;

    const sql = `
    INSERT INTO convidados (nome_morador, numero_salao, nome_convidado, rg, placa_veiculo, ano_veiculo, modelo_veiculo, cor_veiculo, data_evento)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [nomeMorador, numeroSalao, nomeConvidado, rgConvidado, placaVeiculo, anoVeiculo, modeloVeiculo, corVeiculo, dataEvento],
        (err, results) => {
            if (err) {
                console.error('Erro ao inserir convidado:', err);
                return res.status(500).json({ error: 'Erro ao cadastrar convidado' });
            }

            // Buscar o convidado recém-inserido para retornar seus dados completos
            db.query('SELECT * FROM convidados WHERE id = ?', [results.insertId], (err, rows) => {
                if (err) {
                    return res.status(500).json({ error: 'Erro ao recuperar dados do convidado cadastrado'});
                }

                res.status(201).json({
                    success: true,
                    message: 'Convidado cadastrado com sucesso',
                    convidado: rows[0]
                });
            });
        }
    );
});


app.get('/api/convidados', (req, res) => {
    db.query('SELECT * FROM convidados ORDER BY data_cadastro DESC', (err, results) => {
        if (err) {
            console.error('Erro ao buscar convidados:', err);
            return res.status(500).json({ error: 'Erro ao buscar convidados' });
        }

        res.status(200).json(results);
    });
});

app.delete('/api/convidados/:id', (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM convidados WHERE id = ?', [id], (err, result) => {
        if (err) {
            console.error('Erro ao excluir convidado:', err);
            return res.status(500).json({ error: 'Erro ao excluir convidado' });
        }

        res.status(200).json({
            success: true,
            message: 'Convidado excluído com sucesso',
        });
    });
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public',  '/index.html'));
});

// Rota para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
