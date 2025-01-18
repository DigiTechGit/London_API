# README: API de Relatórios

Bem-vindo à documentação da API de Relatórios. Este README tem como objetivo guiar os desenvolvedores na utilização dos endpoints disponíveis para listar e salvar relatórios mensais e de performance.

---

## Endpoints Disponíveis

### 1. Listar Relatórios Mensais
**Endpoint:**
```
POST /relatorio/mensal/listar
```

**Descrição:**
Lista os relatórios mensais com base na data fornecida. A data deve ser enviada no formato `DDMMYY` e os registros retornados correspondem ao intervalo de 00h00 até 23h59 do dia.

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/relatorio/mensal/listar \
-H "Content-Type: application/json" \
-d '{ "data": "100125" }'
```

**Exemplo de Resposta:**
```json
[
  {
    "id": 1,
    "data": "2025-01-10T00:00:00.000Z",
    "totalEntregas": "15",
    "motoristasUnicos": "5",
    "placasUnicas": "3"
  }
]
```

---

### 2. Listar Relatórios de Performance
**Endpoint:**
```
POST /relatorio/performance/listar
```

**Descrição:**
Lista os relatórios de performance com base na data fornecida. A data deve ser enviada no formato `DDMMYY` e os registros retornados correspondem ao intervalo de 00h00 até 23h59 do dia.

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/relatorio/performance/listar \
-H "Content-Type: application/json" \
-d '{ "data": "100125" }'
```

**Exemplo de Resposta:**
```json
[
  {
    "id": 1,
    "data": "2025-01-10T00:00:00.000Z",
    "totalEntregue": "10",
    "totalNaoEntregue": "1",
    "nomeMotorista": "Teste Motorista",
    "placaMotorista": "AAA123A"
  }
]
```

---

### 3. Salvar Relatórios Mensais
**Endpoint:**
```
POST /relatorio/mensal/salvar
```

**Descrição:**
Salva um relatório mensal com base nos dados fornecidos. Todos os campos são obrigatórios.

**Campos do Body:**
- `data` (string): Data no formato `DDMMYY` (ex.: "100125")
- `totalEntregas` (string): Total de entregas realizadas
- `motoristasUnicos` (string): Total de motoristas únicos
- `placasUnicas` (string): Total de placas únicas

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/relatorio/mensal/salvar \
-H "Content-Type: application/json" \
-d '{
  "data": "100125",
  "totalEntregas": "15",
  "motoristasUnicos": "5",
  "placasUnicas": "3"
}'
```

---

### 4. Salvar Relatórios de Performance
**Endpoint:**
```
POST /relatorio/performance/salvar
```

**Descrição:**
Salva um relatório de performance com base nos dados fornecidos. Todos os campos são obrigatórios.

**Campos do Body:**
- `data` (string): Data no formato `DDMMYY` (ex.: "100125")
- `totalEntregue` (string): Total de entregas realizadas
- `totalNaoEntregue` (string): Total de entregas não realizadas
- `placaMotorista` (string): Placa do veículo do motorista
- `nomeMotorista` (string): Nome do motorista

**Exemplo de Requisição:**
```bash
curl -X POST http://localhost:3000/relatorio/performance/salvar \
-H "Content-Type: application/json" \
-d '{
  "data": "100125",
  "totalEntregue": "10",
  "totalNaoEntregue": "1",
  "placaMotorista": "AAA123A",
  "nomeMotorista": "Teste Motorista"
}'
```

---

## Observações Gerais
- **Formato da Data:** Certifique-se de que a data seja enviada no formato `DDMMYY`. Um formato incorreto resultará em erro.
- **Fuso Horário:** Os horários são ajustados automaticamente para UTC, iniciando às 00h00 e terminando às 23h59 do dia selecionado.
- **Erros:** Em caso de erro interno do servidor, verifique os logs para mais detalhes.

---

Para mais informações, entre em contato com o responsável pelo desenvolvimento.
