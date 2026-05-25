"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  status: string;
};

type Produto = {
  sku: string;
  nome: string;
  preco: number;
  estoque: number;
};

type VendaItem = {
  id: string;
  produto: string;
  quantidade: number;
  precoOriginal: number;
  desconto: number;
  preco: number;
};

type ItemCatalogo = VendaItem & {
  produtoSku: string;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const parseNumber = (value: string) => {
  let cleaned = value.replace(/[^0-9,.-]/g, "");
  if (cleaned.includes(",") && cleaned.includes(".")) {
    cleaned = cleaned.replace(/\./g, "");
  }
  cleaned = cleaned.replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function NovaVendaPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [clienteQuery, setClienteQuery] = useState("");
  const [produtoQuery, setProdutoQuery] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [semCliente, setSemCliente] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
  });
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [vendaAntiga, setVendaAntiga] = useState(false);
  const [realizadaEm, setRealizadaEm] = useState("");
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [itemForm, setItemForm] = useState({
    quantidade: "",
    desconto: "0",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingCatalogo, setLoadingCatalogo] = useState(false);
  const [cadastrandoCliente, setCadastrandoCliente] = useState(false);

  const loadCatalogo = async () => {
    setLoadingCatalogo(true);

    try {
      const [clientesResponse, produtosResponse] = await Promise.all([
        fetch("/api/clientes"),
        fetch("/api/produtos"),
      ]);

      if (!clientesResponse.ok || !produtosResponse.ok) {
        throw new Error("Falha ao carregar clientes e produtos");
      }

      const clientesData = (await clientesResponse.json()) as Cliente[];
      const produtosData = (await produtosResponse.json()) as Produto[];
      setClientes(clientesData);
      setProdutos(produtosData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setLoadingCatalogo(false);
    }
  };

  useEffect(() => {
    void loadCatalogo();
  }, []);

  const clientesFiltrados = useMemo(() => {
    const query = clienteQuery.trim().toLowerCase();
    if (!query) {
      return clientes;
    }
    return clientes.filter((cliente) => {
      return (
        cliente.nome.toLowerCase().includes(query) ||
        cliente.email.toLowerCase().includes(query) ||
        cliente.id.toLowerCase().includes(query)
      );
    });
  }, [clienteQuery, clientes]);

  const produtosFiltrados = useMemo(() => {
    const query = produtoQuery.trim().toLowerCase();
    if (!query) {
      return produtos;
    }
    return produtos.filter((produto) => {
      return (
        produto.nome.toLowerCase().includes(query) ||
        produto.sku.toLowerCase().includes(query)
      );
    });
  }, [produtoQuery, produtos]);

  const selecionarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setClienteQuery(cliente.nome);
  };

  const selecionarProduto = (produto: Produto) => {
    setProdutoSelecionado(produto);
    setProdutoQuery(produto.nome);
    setItemForm((prev) => ({ ...prev, desconto: "0" }));
  };

  const quantidadeReservadaPorSku = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const item of itens) {
      mapa.set(item.produtoSku, (mapa.get(item.produtoSku) || 0) + item.quantidade);
    }
    return mapa;
  }, [itens]);

  const estoqueDisponivelAtual = useMemo(() => {
    if (!produtoSelecionado) {
      return 0;
    }
    const reservado = quantidadeReservadaPorSku.get(produtoSelecionado.sku) || 0;
    return Math.max(0, produtoSelecionado.estoque - reservado);
  }, [produtoSelecionado, quantidadeReservadaPorSku]);

  const quantidadeDigitada = Math.floor(parseNumber(itemForm.quantidade));
  const descontoDigitado = parseNumber(itemForm.desconto || "0");
  const precoOriginalSelecionado = produtoSelecionado?.preco || 0;
  const descontoAplicado = Math.min(precoOriginalSelecionado, Math.max(0, descontoDigitado));
  const precoFinalItem = Math.max(0, precoOriginalSelecionado - descontoAplicado);
  const itemPodeSerAdicionado =
    Boolean(produtoSelecionado) &&
    quantidadeDigitada > 0 &&
    quantidadeDigitada <= estoqueDisponivelAtual;

  const handleCadastrarClienteRapido = async () => {
    if (!novoCliente.nome.trim() || !novoCliente.email.trim()) {
      setStatus("Para cadastrar cliente rapido, informe nome e email.");
      return;
    }

    setCadastrandoCliente(true);
    setStatus("");

    try {
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: novoCliente.nome.trim(),
          email: novoCliente.email.trim(),
          telefone: novoCliente.telefone.trim() || undefined,
          status: "Ativo",
        }),
      });

      if (!response.ok) {
        const dataResponse = await response.json().catch(() => null);
        throw new Error(dataResponse?.error || "Falha ao cadastrar cliente");
      }

      const clienteCriado = (await response.json()) as Cliente;
      setClientes((prev) => [clienteCriado, ...prev.filter((item) => item.id !== clienteCriado.id)]);
      setSemCliente(false);
      selecionarCliente(clienteCriado);
      setNovoCliente({ nome: "", email: "", telefone: "" });
      setStatus("Cliente cadastrado e selecionado para esta venda.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setCadastrandoCliente(false);
    }
  };

  const handleAddItem = () => {
    if (!produtoSelecionado) {
      setStatus("Selecione um produto da lista.");
      return;
    }

    const quantidade = Math.floor(parseNumber(itemForm.quantidade));
    const desconto = parseNumber(itemForm.desconto || "0");

    if (quantidade <= 0) {
      setStatus("Preencha a quantidade com um valor maior que zero.");
      return;
    }

    if (quantidade > estoqueDisponivelAtual) {
      setStatus(`Estoque insuficiente. Disponivel para este item: ${estoqueDisponivelAtual}.`);
      return;
    }

    if (desconto < 0 || desconto > produtoSelecionado.preco) {
      setStatus("O desconto precisa ficar entre zero e o preço original do produto.");
      return;
    }

    const newItem: ItemCatalogo = {
      id: `IT-${Date.now()}`,
      produto: produtoSelecionado.nome,
      produtoSku: produtoSelecionado.sku,
      quantidade,
      precoOriginal: Number(produtoSelecionado.preco.toFixed(2)),
      desconto: Number(desconto.toFixed(2)),
      preco: Number((produtoSelecionado.preco - desconto).toFixed(2)),
    };

    setItens((prev) => [...prev, newItem]);
    setProdutoSelecionado(null);
    setProdutoQuery("");
    setItemForm({ quantidade: "", desconto: "0" });
    setStatus("");
  };

  const handleRemoveItem = (id: string) => {
    setItens((prev) => prev.filter((item) => item.id !== id));
  };

  const handleFinalizar = async () => {
    if (itens.length === 0) {
      setStatus("Adicione ao menos um item para finalizar a venda.");
      return;
    }

    if (!semCliente && !clienteSelecionado) {
      setStatus("Selecione um cliente ou marque a opcao de venda sem cliente identificado.");
      return;
    }

    if (vendaAntiga && !realizadaEm) {
      setStatus("Informe a data e hora da venda antiga.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const dataPayload = vendaAntiga ? new Date(realizadaEm) : null;
      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: semCliente ? undefined : clienteSelecionado?.nome,
          realizadaEm: dataPayload ? dataPayload.toISOString() : undefined,
          itens: itens.map((item) => ({
            produtoSku: item.produtoSku,
            produto: item.produto,
            quantidade: item.quantidade,
            desconto: item.desconto,
            preco: item.preco,
          })),
        }),
      });

      if (!response.ok) {
        const dataResponse = await response.json().catch(() => null);
        throw new Error(dataResponse?.error || "Falha ao finalizar venda");
      }

      setClienteQuery("");
      setClienteSelecionado(null);
      setSemCliente(false);
      setNovoCliente({ nome: "", email: "", telefone: "" });
      setVendaAntiga(false);
      setRealizadaEm("");
      setItens([]);
      setProdutoQuery("");
      setProdutoSelecionado(null);
      setItemForm({ quantidade: "", desconto: "0" });
      setStatus("Venda registrada com sucesso.");

      router.push("/vendas");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = useMemo(() => {
    return itens.reduce((acc, item) => acc + item.quantidade * item.precoOriginal, 0);
  }, [itens]);

  const totalDescontos = useMemo(() => {
    return itens.reduce((acc, item) => acc + item.quantidade * item.desconto, 0);
  }, [itens]);

  const totalComDesconto = useMemo(() => {
    return itens.reduce((acc, item) => acc + item.quantidade * item.preco, 0);
  }, [itens]);


  return (
    <section className="grid gap-6">

      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Dados da venda</h2>
          {loadingCatalogo ? <span className="text-sm text-zinc-500">Carregando catalogo...</span> : null}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="clienteBusca">
              Cliente
            </label>
            <label className="flex items-center gap-2 text-sm text-zinc-600">
              <input
                type="checkbox"
                checked={semCliente}
                onChange={(event) => {
                  const marcado = event.target.checked;
                  setSemCliente(marcado);
                  if (marcado) {
                    setClienteSelecionado(null);
                    setClienteQuery("");
                  }
                }}
              />
              Venda sem cliente identificado
            </label>
            <input
              id="clienteBusca"
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm"
              placeholder="Buscar por nome, email ou codigo"
              value={clienteQuery}
              disabled={semCliente}
              onChange={(event) => {
                setClienteQuery(event.target.value);
                setClienteSelecionado(null);
              }}
            />
            <div className="mt-2 max-h-48 overflow-auto rounded-xl border border-zinc-200 bg-white">
              {semCliente ? (
                <p className="px-4 py-3 text-sm text-zinc-500">Esta venda sera registrada sem cliente.</p>
              ) : (
                clientesFiltrados.slice(0, 6).map((cliente) => (
                  <button
                    key={cliente.id}
                    type="button"
                    className="flex w-full min-w-0 items-center justify-between border-b border-zinc-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-zinc-50"
                    onClick={() => selecionarCliente(cliente)}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">{cliente.nome}</p>
                      <p className="truncate text-xs text-zinc-500">{cliente.email}</p>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-500">{cliente.id}</span>
                  </button>
                ))
              )}
              {!semCliente && clientesFiltrados.length === 0 ? (
                <p className="px-4 py-3 text-sm text-zinc-500">Nenhum cliente encontrado.</p>
              ) : null}
            </div>
            {clienteSelecionado && !semCliente ? (
              <p className="break-words text-xs font-medium text-emerald-700">
                Selecionado: {clienteSelecionado.nome}
              </p>
            ) : null}
            <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Cadastro rápido</p>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <input
                  className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
                  placeholder="Nome"
                  value={novoCliente.nome}
                  onChange={(event) =>
                    setNovoCliente((prev) => ({ ...prev, nome: event.target.value }))
                  }
                />
                <input
                  className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
                  placeholder="Email"
                  value={novoCliente.email}
                  onChange={(event) =>
                    setNovoCliente((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
                <input
                  className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm"
                  placeholder="Telefone (opcional)"
                  value={novoCliente.telefone}
                  onChange={(event) =>
                    setNovoCliente((prev) => ({ ...prev, telefone: event.target.value }))
                  }
                />
              </div>
              <button
                type="button"
                className="mt-3 h-10 rounded-full border border-zinc-300 px-4 text-xs font-semibold"
                onClick={() => void handleCadastrarClienteRapido()}
                disabled={cadastrandoCliente}
              >
                {cadastrandoCliente ? "Cadastrando..." : "Cadastrar e selecionar"}
              </button>
            </div>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <input
                type="checkbox"
                checked={vendaAntiga}
                onChange={(event) => setVendaAntiga(event.target.checked)}
              />
              Registrar venda antiga
            </label>
            {vendaAntiga ? (
              <input
                type="datetime-local"
                className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm"
                value={realizadaEm}
                onChange={(event) => setRealizadaEm(event.target.value)}
              />
            ) : (
              <p className="text-xs text-zinc-500">
                Sem essa opcao, a venda sera registrada automaticamente com a data e hora atuais.
              </p>
            )}
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium text-zinc-700">Itens no carrinho</label>
            <div className="h-11 rounded-xl border border-zinc-300 bg-zinc-50 px-4 pt-3 text-sm text-zinc-700">
              {itens.length} item(ns)
            </div>
          </div>
        </div>
      </div>

<div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
  <div className="flex items-center justify-between gap-4">
    <h2 className="text-lg font-semibold">Adicionar item</h2>
  </div>

  {/* Produto */}
  <div className="mt-6 grid gap-2">
    <label className="text-sm font-medium text-zinc-700" htmlFor="produtoBusca">
      Produto
    </label>

    <input
      id="produtoBusca"
      className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-4 text-sm"
      placeholder="Buscar por nome ou SKU"
      value={produtoQuery}
      onChange={(event) => {
        setProdutoQuery(event.target.value);
        setProdutoSelecionado(null);
        setItemForm((prev) => ({ ...prev, desconto: "0" }));
      }}
    />

    <div className="mt-2 max-h-52 overflow-auto rounded-xl border border-zinc-200 bg-white">
      {produtosFiltrados.slice(0, 8).map((produto) => (
        <button
          key={produto.sku}
          type="button"
          className="flex w-full min-w-0 items-center justify-between border-b border-zinc-100 px-4 py-3 text-left text-sm last:border-b-0 hover:bg-zinc-50"
          onClick={() => selecionarProduto(produto)}
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-zinc-900">{produto.nome}</p>
            <p className="truncate text-xs text-zinc-500">SKU {produto.sku}</p>
          </div>
          <div className="shrink-0 text-right text-xs text-zinc-500">
            <p>{formatCurrency(produto.preco)}</p>
            <p>{produto.estoque} em estoque</p>
          </div>
        </button>
      ))}

      {produtosFiltrados.length === 0 ? (
        <p className="px-4 py-3 text-sm text-zinc-500">Nenhum produto encontrado.</p>
      ) : null}
    </div>

    {produtoSelecionado ? (
      <p className="break-words text-xs font-medium text-emerald-700">
        Selecionado: {produtoSelecionado.nome} | Estoque disponível: {estoqueDisponivelAtual}
      </p>
    ) : null}
  </div>

  {/* Inputs alinhados */}
  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

    {/* Quantidade */}
    <div className="grid gap-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor="quantidade">
        Quantidade
      </label>

      <input
        id="quantidade"
        className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
        value={itemForm.quantidade}
        onChange={(event) =>
          setItemForm((prev) => ({ ...prev, quantidade: event.target.value }))
        }
      />

      <div className="min-h-[18px]">
        {produtoSelecionado && quantidadeDigitada > estoqueDisponivelAtual ? (
          <p className="text-xs font-medium text-rose-600">
            Quantidade maior que o estoque disponível ({estoqueDisponivelAtual}).
          </p>
        ) : null}
      </div>
    </div>

    {/* Preço original */}
    <div className="grid gap-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor="precoOriginal">
        Preço original
      </label>

      <input
        id="precoOriginal"
        className="h-11 rounded-xl border border-zinc-300 bg-zinc-50 px-4 text-sm text-zinc-600"
        value={produtoSelecionado ? formatCurrency(produtoSelecionado.preco) : ""}
        readOnly
      />

      {/* espaço fixo para manter alinhamento */}
      <div className="min-h-[18px]" />
    </div>

    {/* Desconto */}
    <div className="grid gap-2">
      <label className="text-sm font-medium text-zinc-700" htmlFor="desconto">
        Desconto unitário
      </label>

      <input
        id="desconto"
        className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
        value={itemForm.desconto}
        onChange={(event) =>
          setItemForm((prev) => ({ ...prev, desconto: event.target.value }))
        }
      />

      <div className="min-h-[18px]">
        <p className="text-xs text-zinc-500">
          Preço final unitário: {formatCurrency(precoFinalItem)}
        </p>
      </div>
    </div>

  </div>

  <button
    type="button"
    className="mt-6 h-11 rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white disabled:opacity-60"
    onClick={handleAddItem}
    disabled={!itemPodeSerAdicionado}
  >
    Adicionar item
  </button>
</div>

      <div className="min-w-0 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold">Itens da venda</h2>
        <div className="mt-6 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-zinc-200 pb-2">
          <table className="min-w-[840px] w-full text-left text-sm">
            <thead className="bg-zinc-100/70 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Qtd</th>
                <th className="px-4 py-3">Preço original</th>
                <th className="px-4 py-3">Desconto</th>
                <th className="px-4 py-3">Preço final</th>
                <th className="px-4 py-3">Subtotal</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">{item.id}</td>
                  <td className="px-4 py-3">{item.produto}</td>
                  <td className="px-4 py-3">{item.quantidade}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatCurrency(item.precoOriginal)}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatCurrency(item.desconto)}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatCurrency(item.preco)}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {formatCurrency(item.quantidade * item.preco)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {status ? <p className="mt-4 text-sm text-zinc-600">{status}</p> : null}
      </div>

      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <div className="mt-6 grid gap-4 rounded-2xl border border-dashed border-zinc-200 p-6 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Subtotal</span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Descontos</span>
            <span className="font-semibold">{formatCurrency(totalDescontos)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200 pt-4 text-base">
            <span className="font-medium">Total</span>
            <span className="font-semibold">{formatCurrency(totalComDesconto)}</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 h-12 w-full rounded-full bg-emerald-600 text-sm font-semibold text-white"
          onClick={handleFinalizar}
          disabled={loading}
        >
          {loading ? "Finalizando..." : "Finalizar venda"}
        </button>
        <Link
          className="mt-3 block h-12 w-full rounded-full border border-zinc-300 pt-3 text-center text-sm font-semibold"
          href="/vendas"
        >
          Voltar para a lista
        </Link>
      </div>
    </section>
  );
}
