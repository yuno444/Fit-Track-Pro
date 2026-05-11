import React, { useMemo } from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Circle, Line, Polyline, Rect } from "react-native-svg";

const PADDING = 28;
const PADDING_BOTTOM = 22;

type LineChartProps = {
  /** Y values in display order (left → right). */
  series: number[];
  width: number;
  height: number;
  strokeColor?: string;
};

/** Minimal line chart (no axes numerics). */
export function SvgSparkline({ series, width, height, strokeColor = "#1D4ED8" }: LineChartProps) {
  const layout = useMemo(() => {
    const n = series.length;
    if (n === 0 || width <= 0) return null;
    const innerW = width - PADDING * 2;
    const innerH = height - PADDING - PADDING_BOTTOM;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = max - min || 1;
    const pts: string[] = [];
    const vertices: { cx: number; cy: number }[] = [];
    for (let i = 0; i < n; i++) {
      const x = PADDING + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
      const yNorm = (series[i] - min) / span;
      const y = PADDING + innerH * (1 - yNorm);
      pts.push(`${x},${y}`);
      vertices.push({ cx: x, cy: y });
    }
    return { path: pts.join(" "), single: n === 1, pt: n === 1 ? pts[0] : null, vertices };
  }, [series, width, height]);

  if (!layout || series.length === 0) {
    return (
      <View style={[styles.sparkEmpty, width > 0 ? { width } : { alignSelf: "stretch" }]}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const innerW = width - PADDING * 2;
  const innerH = height - PADDING - PADDING_BOTTOM;
  const baselineY = PADDING + innerH;


  if (layout.single && layout.pt) {
    const [, yStr] = layout.pt.split(",");
    const cx = PADDING + innerW / 2;
    const cy = Number(yStr);
    return (
      <Svg width={width} height={height}>
        <Line x1={PADDING} y1={baselineY} x2={width - PADDING} y2={baselineY} stroke="#D1D5DB" strokeWidth={1} />
        <Circle cx={cx} cy={cy} r={6} fill={strokeColor} />
      </Svg>
    );
  }

  return (
    <Svg width={width} height={height}>
      <Line x1={PADDING} y1={baselineY} x2={width - PADDING} y2={baselineY} stroke="#D1D5DB" strokeWidth={1} />
      <Polyline
        points={layout.path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {layout.vertices.map((v, i) => (
        <Circle key={i} cx={v.cx} cy={v.cy} r={5} fill={strokeColor} stroke="#FFFFFF" strokeWidth={1.5} />
      ))}
    </Svg>
  );
}

type BarChartProps = {
  values: number[];
  width: number;
  height: number;
  barColor?: string;
};

/** Vertical bars, one per value. */
export function SvgBarChart({ values, width, height, barColor = "#2563EB" }: BarChartProps) {
  const layout = useMemo(() => {
    const n = values.length;
    if (n === 0 || width <= 0) return null;
    const pad = 8;
    const innerW = width - pad * 2;
    const innerH = height - PADDING_BOTTOM - 8;
    const maxV = Math.max(1, ...values);
    const gap = 4;
    const barW = Math.max(2, (innerW - gap * (n - 1)) / n);
    const bars = values.map((v, i) => {
      const h = innerH * (v / maxV);
      const x = pad + i * (barW + gap);
      const y = 8 + innerH - h;
      return { x, y, w: barW, h: Math.max(v > 0 ? 2 : 0, h) };
    });
    return { bars, baseline: 8 + innerH };
  }, [values, width, height]);

  if (!layout) {
    return (
      <View style={[styles.barEmpty, { width }]}>
        <Text style={styles.emptyText}>No data</Text>
      </View>
    );
  }

  return (
    <Svg width={width} height={height}>
      <Line
        x1={8}
        y1={layout.baseline}
        x2={width - 8}
        y2={layout.baseline}
        stroke="#D1D5DB"
        strokeWidth={1}
      />
      {layout.bars.map((b, i) => (
        <Rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={3} fill={barColor} />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({

  sparkEmpty: {
    alignSelf: "stretch",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  barEmpty: {
    alignSelf: "stretch",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { color: "#9CA3AF", fontSize: 13, fontWeight: "600" },
});
