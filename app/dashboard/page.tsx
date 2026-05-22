"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Indicador = {
  titulo: string;
  valor: number;
  detalhe: string;
};

type PerformanceItem = {
  label: string;
  valor: number;
  totalVendido?: number;
};

type Alerta = {
  id: string;
  titulo: string;
  nivel: string;
  estoque: number;
};

type ChartPoint = {
  x: number;
  y: number;
  value: number;
  label: string;
  totalVendido?: number;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const chartWidth = 760;
const chartHeight = 260;

const chartPadding = {
  top: 24,
  right: 24,
  bottom: 44,
  left: 24,
};

const buildChartPoints = (
  items: PerformanceItem[],
  chartMode: "quantidade" | "valor"
) => {
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;

  const maxValue = Math.max(
    1,
    ...items.map((item) =>
      chartMode === "quantidade" ? item.valor : item.totalVendido || 0
    )
  );

  return items.map((item, index) => {
    const currentValue =
      chartMode === "quantidade" ? item.valor : item.totalVendido || 0;

    const x =
      items.length === 1
        ? chartPadding.left + plotWidth / 2
        : chartPadding.left + (plotWidth * index) / (items.length - 1);

    const y =
      chartPadding.top + plotHeight * (1 - currentValue / maxValue);

    return {
      x,
      y,
      value: currentValue,
      label: item.label,
      totalVendido: item.totalVendido,
    } satisfies ChartPoint;
  });
};

const DENSE_THRESHOLD = 31;

export default function DashboardPage() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [performance, setPerformance] = useState<PerformanceItem[]>([]);
  const [preset, setPreset] = useState("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [chartMode, setChartMode] = useState<"quantidade" | "valor">("quantidade");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (preset === "custom" && (!customStart || !customEnd)) return;

    let active = true;

    const query =
      preset === "custom"
        ? `?preset=custom&start=${customStart}&end=${customEnd}`
        : `?preset=${preset}`;

    const loadDashboard = async () => {
      await Promise.resolve();
      if (!active) return;

      setLoading(true);
      setStatus("");

      try {
        const response = await fetch(`/api/dashboard${query}`);
        if (!response.ok) throw new Error("Falha ao carregar dashboard");

        const data = await response.json();
        if (!active) return;

        setIndicadores(data.indicadores || []);
        setAlertas(data.alertas || []);
        setPerformance(data.performance || []);
      } catch (error) {
        if (!active) return;
        setStatus(error instanceof Error ? error.message : "Erro inesperado");
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadDashboard();
    return () => {
      active = false;
    };
  }, [preset, customStart, customEnd]);

  const presets = [
    { key: "day", label: "Hoje" },
    { key: "7d", label: "7 dias" },
    { key: "30d", label: "30 dias" },
    { key: "6m", label: "6 meses" },
    { key: "custom", label: "Personalizado" },
  ];

  const chartData = useMemo(() => {
    return performance.map((item) => ({
      label: item.label,
      valor: item.valor,
      totalVendido: item.totalVendido || 0,
    }));
  }, [performance]);

  const chartPoints = buildChartPoints(chartData, chartMode);
  const isDense = chartPoints.length >= DENSE_THRESHOLD;
  const hoveredPoint = hoveredIndex !== null ? chartPoints[hoveredIndex] : null;

  const chartMaxValue = Math.max(
    1,
    ...chartData.map((item) =>
      chartMode === "quantidade" ? item.valor : item.totalVendido || 0
    )
  );

  const chartLinePath =
    chartPoints.length > 0
      ? `M ${chartPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
      : "";

  const chartAreaPath =
    chartPoints.length > 0
      ? `${chartLinePath} L ${chartPoints[chartPoints.length - 1].x} ${
          chartHeight - chartPadding.bottom
        } L ${chartPoints[0].x} ${chartHeight - chartPadding.bottom} Z`
      : "";

  const maxLabels = isDense ? 8 : 6;

  return (
    <section className="grid gap-8">
      <header className="rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {presets.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPreset(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                preset === item.key
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 text-zinc-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {preset === "custom" ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="grid gap-1">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                htmlFor="start"
              >
                Inicio
              </label>
              <input
                id="start"
                type="date"
                className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <label
                className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
                htmlFor="end"
              >
                Fim
              </label>
              <input
                id="end"
                type="date"
                className="h-10 rounded-xl border border-zinc-300 bg-white px-3 text-sm"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
            </div>
          </div>
        ) : null}
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {indicadores.map((card) => (
          <div
            key={card.titulo}
            className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {card.titulo}
            </p>
            <p className="mt-4 text-3xl font-semibold text-zinc-900">
              {card.titulo === "Total vendido"
                ? formatCurrency(card.valor)
                : card.titulo === "Estoque baixo"
                ? `${card.valor} itens`
                : card.valor}
            </p>
            <p className="mt-2 text-sm text-emerald-700">{card.detalhe}</p>
          </div>
        ))}
      </div>

      {loading ? <p className="text-sm text-zinc-500">Atualizando...</p> : null}
      {status ? <p className="text-sm text-zinc-600">{status}</p> : null}

      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Vendas por dia</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Linha de evolução no período selecionado.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setChartMode("quantidade")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                chartMode === "quantidade"
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 text-zinc-700"
              }`}
            >
              Quantidade
            </button>
            <button
              type="button"
              onClick={() => setChartMode("valor")}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                chartMode === "valor"
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 text-zinc-700"
              }`}
            >
              Valor vendido
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-4">
          {chartData.length === 0 ? (
            <p className="text-sm text-zinc-500">Sem dados para o periodo.</p>
          ) : (
            <div ref={chartContainerRef} className="relative h-[260px] w-full">

              {/* Tooltip */}
              {hoveredPoint && hoveredIndex !== null ? (
                <div
                  className="pointer-events-none absolute z-20 rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-xl"
                  style={{
                    left: `clamp(0px, calc(${(hoveredPoint.x / chartWidth) * 100}% - 80px), calc(100% - 160px))`,
                    top: hoveredPoint.y < 80 ? hoveredPoint.y + 12 : hoveredPoint.y - 88,
                  }}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    {hoveredPoint.label}
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium text-zinc-700">
                      Quantidade: {chartData[hoveredIndex]?.valor ?? 0}
                    </p>
                    <p className="text-sm font-medium text-zinc-700">
                      Valor vendido: {formatCurrency(hoveredPoint.totalVendido || 0)}
                    </p>
                  </div>
                </div>
              ) : null}

              {/* Colunas de hover — ANTES do SVG no DOM */}
              <div
                className="absolute z-10 flex cursor-crosshair"
                style={{
                  top: chartPadding.top,
                  bottom: chartPadding.bottom,
                  left: `${(chartPadding.left / chartWidth) * 100}%`,
                  right: `${(chartPadding.right / chartWidth) * 100}%`,
                }}
              >
                {chartPoints.map((_, index) => (
                  <div
                    key={index}
                    className="h-full flex-1"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ))}
              </div>

              {/* SVG — pointer-events none, nunca interfere */}
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="absolute inset-0 h-full w-full overflow-visible"
                style={{ pointerEvents: "none" }}
                role="img"
                aria-label="Gráfico de vendas por dia"
              >
                {[0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y =
                    chartPadding.top +
                    (chartHeight - chartPadding.top - chartPadding.bottom) *
                      (1 - ratio);
                  const axisValue = chartMaxValue * ratio;

                  return (
                    <g key={ratio}>
                      <line
                        x1={chartPadding.left}
                        x2={chartWidth - chartPadding.right}
                        y1={y}
                        y2={y}
                        stroke="#e4e4e7"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={chartPadding.left - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-zinc-400 text-[10px] font-semibold uppercase"
                      >
                        {chartMode === "valor"
                          ? formatCurrency(axisValue)
                          : Math.round(axisValue)}
                      </text>
                    </g>
                  );
                })}

                <line
                  x1={chartPadding.left}
                  x2={chartWidth - chartPadding.right}
                  y1={chartHeight - chartPadding.bottom}
                  y2={chartHeight - chartPadding.bottom}
                  stroke="#d4d4d8"
                />

                <defs>
                  <linearGradient
                    id="salesAreaGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#18181b" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#18181b" stopOpacity="0.03" />
                  </linearGradient>
                </defs>

                {chartAreaPath ? (
                  <path d={chartAreaPath} fill="url(#salesAreaGradient)" />
                ) : null}

                {chartLinePath ? (
                  <path
                    d={chartLinePath}
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : null}

                {hoveredPoint ? (
                  <line
                    x1={hoveredPoint.x}
                    x2={hoveredPoint.x}
                    y1={chartPadding.top}
                    y2={chartHeight - chartPadding.bottom}
                    stroke="#a1a1aa"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                ) : null}

                {hoveredPoint ? (
                  <>
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="10"
                      fill="#18181b"
                      fillOpacity="0.10"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={hoveredPoint.y}
                      r="5"
                      fill="#18181b"
                    />
                  </>
                ) : null}

                {!isDense
                  ? chartPoints.map((point, index) => {
                      if (index === hoveredIndex) return null;
                      return (
                        <circle
                          key={index}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="#18181b"
                        />
                      );
                    })
                  : null}

                {chartPoints.map((point, index) => {
                  const shouldShowLabel =
                    index === 0 ||
                    index === chartPoints.length - 1 ||
                    index % Math.ceil(chartPoints.length / maxLabels) === 0;

                  if (!shouldShowLabel) return null;

                  return (
                    <text
                      key={index}
                      x={point.x}
                      y={chartHeight - chartPadding.bottom + 22}
                      textAnchor="middle"
                      className="fill-zinc-500 text-[11px] font-medium"
                    >
                      {point.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">Estoque baixo</h2>
        <div className="mt-6 grid gap-4">
          {alertas.map((alerta) => (
            <div
              key={alerta.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-200 p-4"
            >
              <div>
                <p className="text-sm font-semibold text-zinc-900">
                  {alerta.titulo}
                </p>
                <p className="text-xs text-zinc-500">
                  Estoque: {alerta.estoque} un
                </p>
              </div>
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                {alerta.nivel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
