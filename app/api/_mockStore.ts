export type Cliente = {
  id: string;
  nome: string;
  email: string;
  status: "Ativo" | "Inativo";
  telefone?: string;
};

export type Produto = {
  sku: string;
  nome: string;
  preco: number;
  estoque: number;
};

export type VendaItem = {
  id: string;
  produto: string;
  quantidade: number;
  precoOriginal: number;
  desconto: number;
  preco: number;
};

export type Venda = {
  id: string;
  cliente: string | null;
  data: string;
  itens: VendaItem[];
  total: number;
};

let clienteCounter = 1003;
let produtoCounter = 2003;
let vendaCounter = 1000;
let itemCounter = 10;

let clientes: Cliente[] = [
  { id: "CL-1001", nome: "Loja Norte", email: "contato@lojanorte.com", status: "Ativo" },
  { id: "CL-1002", nome: "Mercado Sol", email: "vendas@mercadosol.com", status: "Ativo" },
  { id: "CL-1003", nome: "Boutique Rua 7", email: "financeiro@rua7.com", status: "Inativo" },
];

let produtos: Produto[] = [
  { sku: "PR-2001", nome: "Camiseta Basica", preco: 39.9, estoque: 120 },
  { sku: "PR-2002", nome: "Calca Slim", preco: 129.9, estoque: 34 },
  { sku: "PR-2003", nome: "Tenis Urbano", preco: 299.9, estoque: 8 },
];

let vendas: Venda[] = [
  {
    id: "VD-1001",
    cliente: "Loja Norte",
    data: "2026-05-18",
    itens: [
      {
        id: "IT-01",
        produto: "Camiseta Basica",
        quantidade: 2,
        precoOriginal: 39.9,
        desconto: 0,
        preco: 39.9,
      },
      {
        id: "IT-02",
        produto: "Tenis Urbano",
        quantidade: 1,
        precoOriginal: 299.9,
        desconto: 0,
        preco: 299.9,
      },
    ],
    total: 379.7,
  },
];

const toId = (prefix: string, counter: number) => {
  return `${prefix}-${String(counter).padStart(4, "0")}`;
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value !== "string") {
    return 0;
  }
  let cleaned = value.replace(/[^0-9,.-]/g, "");
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "");
  }
  cleaned = cleaned.replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const listClientes = () => {
  return [...clientes];
};

export const createCliente = (data: Partial<Cliente>) => {
  clienteCounter += 1;
  const novo: Cliente = {
    id: toId("CL", clienteCounter),
    nome: data.nome?.trim() || "Novo cliente",
    email: data.email?.trim() || "cliente@empresa.com",
    status: data.status === "Inativo" ? "Inativo" : "Ativo",
    telefone: data.telefone?.trim() || "",
  };
  clientes = [novo, ...clientes];
  return novo;
};

export const updateCliente = (id: string, data: Partial<Cliente>) => {
  let updated: Cliente | null = null;
  clientes = clientes.map((cliente) => {
    if (cliente.id !== id) {
      return cliente;
    }
    updated = {
      ...cliente,
      nome: data.nome?.trim() || cliente.nome,
      email: data.email?.trim() || cliente.email,
      status: data.status === "Inativo" ? "Inativo" : "Ativo",
      telefone: data.telefone?.trim() || cliente.telefone,
    };
    return updated;
  });
  return updated;
};

export const deleteCliente = (id: string) => {
  const before = clientes.length;
  clientes = clientes.filter((cliente) => cliente.id !== id);
  return clientes.length !== before;
};

export const listProdutos = () => {
  return [...produtos];
};

export const createProduto = (data: Partial<Produto>) => {
  produtoCounter += 1;
  const novo: Produto = {
    sku: toId("PR", produtoCounter),
    nome: data.nome?.trim() || "Novo produto",
    preco: parseNumber(data.preco),
    estoque: Math.max(0, Math.floor(parseNumber(data.estoque))),
  };
  produtos = [novo, ...produtos];
  return novo;
};

export const updateProduto = (sku: string, data: Partial<Produto>) => {
  let updated: Produto | null = null;
  produtos = produtos.map((produto) => {
    if (produto.sku !== sku) {
      return produto;
    }
    updated = {
      ...produto,
      nome: data.nome?.trim() || produto.nome,
      preco: parseNumber(data.preco ?? produto.preco),
      estoque: Math.max(0, Math.floor(parseNumber(data.estoque ?? produto.estoque))),
    };
    return updated;
  });
  return updated;
};

export const deleteProduto = (sku: string) => {
  const before = produtos.length;
  produtos = produtos.filter((produto) => produto.sku !== sku);
  return produtos.length !== before;
};

export const listVendas = () => {
  return [...vendas];
};

export const createVenda = (data: Partial<Venda>) => {
  vendaCounter += 1;
  const itens = (data.itens || []).map((item) => {
    itemCounter += 1;
    return {
      id: item.id || toId("IT", itemCounter),
      produto: item.produto || "Produto",
      quantidade: Math.max(1, Math.floor(parseNumber(item.quantidade))),
      precoOriginal: parseNumber((item as Partial<VendaItem>).precoOriginal ?? item.preco),
      desconto: parseNumber((item as Partial<VendaItem>).desconto),
      preco: parseNumber(item.preco),
    };
  });
  const total = itens.reduce((acc, item) => acc + item.quantidade * item.preco, 0);
  const nova: Venda = {
    id: toId("VD", vendaCounter),
    cliente: data.cliente?.trim() || "Sem cliente informado",
    data: data.data || new Date().toISOString().slice(0, 10),
    itens,
    total,
  };
  vendas = [nova, ...vendas];

  itens.forEach((item) => {
    const produto = produtos.find((p) => p.nome === item.produto);
    if (produto) {
      produto.estoque = Math.max(0, produto.estoque - item.quantidade);
    }
  });

  return nova;
};

export const getDashboardData = () => {
  const totalVendido = vendas.reduce((acc, venda) => acc + venda.total, 0);
  const quantidadeVendas = vendas.length;
  const estoqueBaixo = produtos.filter((produto) => produto.estoque <= 10);

  return {
    indicadores: [
      {
        titulo: "Total vendido",
        valor: totalVendido,
        detalhe: "+12% vs. semana passada",
      },
      {
        titulo: "Quantidade vendas",
        valor: quantidadeVendas,
        detalhe: "Media diaria: 35",
      },
      {
        titulo: "Estoque baixo",
        valor: estoqueBaixo.length,
        detalhe: "Repor em 48h",
      },
    ],
    alertas: estoqueBaixo.map((produto) => ({
      id: produto.sku,
      titulo: produto.nome,
      nivel: produto.estoque <= 5 ? "Critico" : "Atenção",
      estoque: produto.estoque,
    })),
  };
};
