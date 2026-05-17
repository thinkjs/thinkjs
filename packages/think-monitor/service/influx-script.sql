const FIELDS = {
  cpu_user: Influx.FieldType.INTEGER,
  cpu_system: Influx.FieldType.INTEGER,
  rss: Influx.FieldType.INTEGER,
  heap_total: Influx.FieldType.INTEGER,
  external: Influx.FieldType.INTEGER,
  heap_used: Influx.FieldType.INTEGER,
  time_diff: Influx.FieldType.INTEGER,
  is_master: Influx.FieldType.BOOLEAN
};
const TAGS = [
  'hash', 'host', 'pid'
];

CREATE CONTINUOUS QUERY "cq_minute" ON "perf"
BEGIN
  SELECT sum("cpu_user"), sum("cpu_system"), sum("rss"), sum("heap_total"), sum("external"), sum("heap_used"), time_diff
  INTO "perf_m" FROM "perf" GROUP BY time(1m)
END

DROP MEASUREMENT perf_10s;
DROP MEASUREMENT perf_30s;
DROP CONTINUOUS QUERY cq_10s, cq_30s, cq_host, cq_host_10s, cq_host_30s ON think
DROP CONTINUOUS QUERY cq_30s ON think
CREATE CONTINUOUS QUERY "cq_10s" ON "think" RESAMPLE FOR 1d BEGIN SELECT sum("cpu_user") as cpu_user, sum("cpu_system") as cpu_system, sum("rss") as rss, sum("heap_total") as heap_total, sum("external") as external, sum("heap_used") as heap_used, sum("time_diff") as time_diff INTO "perf_10s" FROM "perf" GROUP BY time(10s), * END
CREATE CONTINUOUS QUERY "cq_30s" ON "think" RESAMPLE FOR 1d BEGIN SELECT sum("cpu_user") as cpu_user, sum("cpu_system") as cpu_system, sum("rss") as rss, sum("heap_total") as heap_total, sum("external") as external, sum("heap_used") as heap_used, sum("time_diff") as time_diff INTO "perf_30s" FROM "perf" GROUP BY time(30s), * END
CREATE CONTINUOUS QUERY "cq_host" ON "think" RESAMPLE FOR 1d BEGIN SELECT sum("cpu_user") as cpu_user, sum("cpu_system") as cpu_system, sum("rss") as rss, sum("heap_total") as heap_total, sum("external") as external, sum("heap_used") as heap_used, sum("time_diff") as time_diff INTO "perf_host" FROM "perf" GROUP BY time(1s), hash, host END
CREATE CONTINUOUS QUERY "cq_host_10s" ON "think" RESAMPLE FOR 1d BEGIN SELECT sum("cpu_user") as cpu_user, sum("cpu_system") as cpu_system, sum("rss") as rss, sum("heap_total") as heap_total, sum("external") as external, sum("heap_used") as heap_used, sum("time_diff") as time_diff INTO "perf_host_10s" FROM "perf" GROUP BY time(10s), hash, host END
CREATE CONTINUOUS QUERY "cq_host_30s" ON "think" RESAMPLE FOR 1d BEGIN SELECT sum("cpu_user") as cpu_user, sum("cpu_system") as cpu_system, sum("rss") as rss, sum("heap_total") as heap_total, sum("external") as external, sum("heap_used") as heap_used, sum("time_diff") as time_diff INTO "perf_host_30s" FROM "perf" GROUP BY time(30s), hash, host END

CREATE CONTINUOUS QUERY "cq_minute" ON "think"
  RESAMPLE FOR 1d
BEGIN
  SELECT sum("cpu_user") as cpu_user, sum("cpu_system") as cpu_system, sum("rss") as rss,
      sum("heap_total") as heap_total, sum("external") as external, sum("heap_used") as heap_used,
      sum("time_diff") as time_diff INTO "perf_m"
  FROM "perf"
  GROUP BY time(1m), *
END