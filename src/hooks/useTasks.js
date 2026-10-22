import { useEffect, useState } from "react";
import { taskApi } from "../api/taskApi.js";

export default function useTasks({
  search,
  category,
  status,
  sort,
  page,
  pageSize,
}) {
  const [result, setResult] = useState({
    items: [],
    total: 0,
    page: 1,
    pageSize,
    totalPages: 1,
    summary: { total: 0, completed: 0 },
  });
  const [loadState, setLoadState] = useState("loading");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoadState("loading");
    setError("");
    taskApi
      .list({
        search,
        category,
        status,
        sort,
        page,
        pageSize,
        signal: controller.signal,
      })
      .then((data) => {
        if (!active) return;
        setResult(data);
        setLoadState("success");
      })
      .catch((failure) => {
        if (!active || failure.name === "AbortError") return;
        setError(failure.message);
        setLoadState("error");
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [search, category, status, sort, page, pageSize, revision]);

  return {
    result,
    loadState,
    error,
    reload: () => setRevision((value) => value + 1),
  };
}
