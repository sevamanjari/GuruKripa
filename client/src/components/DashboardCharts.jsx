import React, { useState } from "react";
import { IndianRupee, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Modern SVG Grouped Bar Chart comparing Billed vs Collected across streams
 */
export function RevenueStreamBarChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const maxVal = Math.max(
    ...((Array.isArray(data) ? data : []).map((d) => Math.max(Number(d?.billed) || 0, Number(d?.collected) || 0))),
    1000
  );
  const chartHeight = 180;
  const barWidth = 24;
  const groupSpacing = 90;
  const startX = 60;

  return (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <svg
        viewBox={`0 0 ${Math.max(380, startX + data.length * groupSpacing + 20)} ${chartHeight + 60}`}
        style={{ width: "100%", height: "240px", overflow: "visible" }}
      >
        {/* Horizontal Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - ratio * (chartHeight - 30) + 15;
          const val = Math.round(ratio * maxVal);
          return (
            <g key={i}>
              <line
                x1={startX - 10}
                y1={y}
                x2="100%"
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={ratio === 0 ? "none" : "3 3"}
                strokeWidth={ratio === 0 ? 1.5 : 1}
              />
              <text
                x={startX - 15}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
                fontFamily="sans-serif"
              >
                ₹{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const xCenter = startX + idx * groupSpacing + 30;
          const billedH = ((item.billed || 0) / maxVal) * (chartHeight - 30);
          const collectedH = ((item.collected || 0) / maxVal) * (chartHeight - 30);

          const billedY = chartHeight + 15 - billedH;
          const collectedY = chartHeight + 15 - collectedH;

          const isHovered = hoveredIdx === idx;

          return (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Highlight background on hover */}
              {isHovered && (
                <rect
                  x={xCenter - 30}
                  y={10}
                  width={60}
                  height={chartHeight + 10}
                  fill="#f1f5f9"
                  rx="4"
                  opacity="0.7"
                />
              )}

              {/* Billed Bar (Slate/Navy) */}
              <rect
                x={xCenter - barWidth - 2}
                y={billedY}
                width={barWidth}
                height={Math.max(billedH, 3)}
                rx="4"
                fill="#0f172a"
                opacity={isHovered ? 1 : 0.85}
              />

              {/* Collected Bar (Emerald Green) */}
              <rect
                x={xCenter + 2}
                y={collectedY}
                width={barWidth}
                height={Math.max(collectedH, 3)}
                rx="4"
                fill="#16a34a"
                opacity={isHovered ? 1 : 0.85}
              />

              {/* Category Label */}
              <text
                x={xCenter}
                y={chartHeight + 35}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={isHovered ? "#0f172a" : "#475569"}
              >
                {item.label}
              </text>

              {/* Due Label */}
              <text
                x={xCenter}
                y={chartHeight + 50}
                textAnchor="middle"
                fontSize="9.5"
                fill={item.due > 0 ? "#dc2626" : "#16a34a"}
                fontWeight="500"
              >
                Due: ₹{(item.due || 0).toLocaleString("en-IN")}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip if Hovered */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "#0f172a",
            color: "#ffffff",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "0.75rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2)",
            pointerEvents: "none",
            zIndex: 10
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "3px" }}>{data[hoveredIdx]?.label}</div>
          <div>Billed: ₹{(Number(data[hoveredIdx]?.billed) || 0).toLocaleString("en-IN")}</div>
          <div style={{ color: "#4ade80" }}>Collected: ₹{(Number(data[hoveredIdx]?.collected) || 0).toLocaleString("en-IN")}</div>
          <div style={{ color: "#f87171" }}>Pending Due: ₹{(Number(data[hoveredIdx]?.due) || 0).toLocaleString("en-IN")}</div>
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "6px",
          fontSize: "0.75rem",
          fontWeight: 600
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#0f172a" }} />
          <span>Total Billed</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "#16a34a" }} />
          <span>Collected</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Modern SVG Donut Chart showing Stream Share
 */
export function StreamDistributionDonutChart({ data = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);
  const size = 180;
  const radius = 65;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", flexWrap: "wrap", gap: "16px" }}>
      <div style={{ position: "relative", width: `${size}px`, height: `${size}px` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Base empty ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {total === 0 ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
            />
          ) : (
            data.map((item, idx) => {
              const fraction = item.value / total;
              const strokeDasharray = `${fraction * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += fraction;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${center} ${center})`}
                  style={{
                    cursor: "pointer",
                    transition: "stroke-width 0.2s ease, opacity 0.2s ease",
                    opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })
          )}
        </svg>

        {/* Center Donut Text */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}
        >
          <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>
            {hoveredIdx !== null && data[hoveredIdx] ? data[hoveredIdx].label : "Operations"}
          </span>
          <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-primary)" }}>
            {hoveredIdx !== null && data[hoveredIdx]
              ? `₹${(Number(data[hoveredIdx].value) || 0).toLocaleString("en-IN")}`
              : `₹${(Number(total) || 0).toLocaleString("en-IN")}`}
          </span>
          {hoveredIdx !== null && data[hoveredIdx] && total > 0 && (
            <span style={{ fontSize: "0.7rem", color: data[hoveredIdx].color, fontWeight: 700 }}>
              {Math.round(((Number(data[hoveredIdx].value) || 0) / total) * 100)}% share
            </span>
          )}
        </div>
      </div>

      {/* Legend Column */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", minWidth: "150px" }}>
        {data.map((item, idx) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "4px 6px",
                borderRadius: "4px",
                background: hoveredIdx === idx ? "#f8fafc" : "transparent",
                cursor: "pointer",
                transition: "background 0.15s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
                <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                  {item.label}
                </span>
              </div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-primary)" }}>
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Modern Recovery Rate Circular Gauge
 */
export function RecoveryGauge({ rate = 0, totalBilled = 0, totalPaid = 0, totalDue = 0 }) {
  const boundedRate = Math.min(Math.max(rate, 0), 100);
  const size = 150;
  const radius = 55;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = Math.PI * radius; // Half circle (180 deg)
  const strokeDashoffset = circumference - (boundedRate / 100) * circumference;

  const color = boundedRate >= 80 ? "#16a34a" : boundedRate >= 50 ? "#d97706" : "#dc2626";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: `${size}px`, height: `${size / 2 + 25}px`, overflow: "hidden" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            transform={`rotate(180 ${center} ${center})`}
          />
          {/* Progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(180 ${center} ${center})`}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>

        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <span style={{ fontSize: "1.45rem", fontWeight: 800, color, lineHeight: 1 }}>
            {boundedRate}%
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "2px" }}>
            Recovery Rate
          </span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          width: "100%",
          marginTop: "10px",
          paddingTop: "10px",
          borderTop: "1px solid var(--border-default)"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Collected</div>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#16a34a" }}>
            ₹{(Number(totalPaid) || 0).toLocaleString("en-IN")}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Pending Due</div>
          <div style={{ fontSize: "0.82rem", fontWeight: 700, color: totalDue > 0 ? "#dc2626" : "#16a34a" }}>
            ₹{(Number(totalDue) || 0).toLocaleString("en-IN")}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Top Pending Debtors Horizontal Bar Chart
 */
export function TopDebtorsBarChart({ debtors = [], onSelectCustomer }) {
  const safeDebtors = Array.isArray(debtors) ? debtors : [];
  if (safeDebtors.length === 0) {
    return (
      <div style={{ padding: "24px 0", textAlign: "center", color: "#16a34a", fontSize: "0.85rem" }}>
        <CheckCircle2 size={24} style={{ margin: "0 auto 6px" }} />
        <div>Zero outstanding debt! All accounts cleared.</div>
      </div>
    );
  }

  const maxDue = Math.max(...safeDebtors.map((d) => Number(d?.dueAmount) || 0), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {safeDebtors.slice(0, 5).map((d, i) => {
        const due = Number(d?.dueAmount) || 0;
        const pct = Math.round((due / maxDue) * 100);
        return (
          <div key={i} style={{ fontSize: "0.78rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  cursor: onSelectCustomer ? "pointer" : "default"
                }}
                onClick={() => onSelectCustomer && onSelectCustomer(d)}
                title="View customer"
              >
                {d?.name || "Customer"} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>({d?.phone || "-"})</span>
              </span>
              <span style={{ fontWeight: 700, color: "#dc2626" }}>
                ₹{due.toLocaleString("en-IN")}
              </span>
            </div>
            {/* Progress Track */}
            <div
              style={{
                height: "7px",
                borderRadius: "999px",
                background: "var(--bg-subtle, #f1f5f9)",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #f87171, #dc2626)",
                  transition: "width 0.4s ease"
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
