// src/components/Kanban/KanbanBoard.jsx

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Link } from "react-router-dom";
import { authorizedRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

/**
 * 安定化ポイントまとめ
 * - 初回ロードは isAuthReady && user && token のときだけ（1回）
 * - 列・カードを memo 化して再レンダリングコストを削減
 * - オプティミスティック更新（成功時は再フェッチを行わない）
 * - エラー時のみ loadPipelines() で復旧（最小限の再取得）
 * - Skeleton（レイアウト維持）でちらつきを軽減
 */

/* statuses をコンポーネント外に固定（再生成を防ぐ） */
const STATUSES = ["見込み", "提案中", "契約済"];

/* Card コンポーネント（memo） */
const Card = memo(function Card({ customer, provided, snapshot }) {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={`bg-white rounded-lg p-4 shadow-md transition-all duration-150 cursor-pointer ${
        snapshot.isDragging ? "shadow-lg scale-105" : ""
      }`}
    >
      <Link
        to={`/customers/${customer._id}`}
        className="block text-inherit no-underline"
      >
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {customer.companyName}
        </h3>
        <p className="text-sm text-gray-600">{customer.name}</p>
      </Link>
    </div>
  );
});

/* Column コンポーネント（memo） */
const Column = memo(function Column({ status, items }) {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`bg-gray-100 rounded-xl p-4 w-72 min-w-72 flex flex-col gap-3 h-fit max-h-[calc(100vh-100px)] overflow-y-auto transition-colors duration-200 ${
            snapshot.isDraggingOver ? "bg-gray-200" : ""
          }`}
        >
          <h2 className="text-xl font-semibold text-gray-700 mb-2 pb-2 border-b-2 border-gray-200">
            {status}
          </h2>

          {items && items.length > 0 ? (
            items.map((customer, index) => (
              <Draggable
                key={customer._id}
                draggableId={customer._id}
                index={index}
              >
                {(provided, snapshot) => (
                  <Card
                    customer={customer}
                    provided={provided}
                    snapshot={snapshot}
                  />
                )}
              </Draggable>
            ))
          ) : (
            <div className="text-gray-500 italic text-center p-4">
              顧客がありません
            </div>
          )}

          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
});

const KanbanBoard = () => {
  const { user, token, isAuthReady } = useAuth();

  // pipelines: { "見込み": [...], "提案中": [...], ... }
  const [pipelines, setPipelines] = useState(() =>
    STATUSES.reduce((acc, s) => ({ ...acc, [s]: [] }), {})
  );
  const [loading, setLoading] = useState(true);
  const didInitialLoadRef = useRef(false); // 初回ロードを1度だけにするフラグ
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchCustomersByStatus = useCallback(
    async (status, signal) => {
      if (!user || !token) return [];
      try {
        // authorizedRequest が signal をサポートしていれば渡す（未対応なら無視される）
        const response = await authorizedRequest(
          "GET",
          `/customers/status/${encodeURIComponent(status)}`,
          { signal }
        );
        // 期待: response は配列
        return Array.isArray(response) ? response : [];
      } catch (error) {
        console.error(`顧客取得エラー (${status}):`, error);
        return [];
      }
    },
    [user, token]
  );

  const loadPipelines = useCallback(
    async (opts = { signal: null }) => {
      if (!user || !token) return;
      setLoading(true);
      try {
        const { signal } = opts;
        const promises = STATUSES.map((status) =>
          fetchCustomersByStatus(status, signal)
        );
        const results = await Promise.all(promises);
        const newPipelines = {};
        STATUSES.forEach((status, i) => {
          newPipelines[status] = results[i] || [];
        });
        if (isMountedRef.current) {
          setPipelines(newPipelines);
          setLoading(false);
        }
      } catch (err) {
        if (!isMountedRef.current) return;
        console.error("loadPipelines error:", err);
        setLoading(false);
      }
    },
    [user, token, fetchCustomersByStatus]
  );

  /* 初回ロード: isAuthReady が true になったときに一度だけ呼ぶ */
  useEffect(() => {
    if (!isAuthReady || !user || !token) return;
    if (didInitialLoadRef.current) return;

    didInitialLoadRef.current = true;

    const ac = new AbortController();
    loadPipelines({ signal: ac.signal });

    return () => ac.abort();
  }, [isAuthReady, user, token, loadPipelines]);

  /* onDragEnd: オプティミスティック更新、成功時は再フェッチしない（チラつきを抑える） */
  const onDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (
        destination.droppableId === source.droppableId &&
        destination.index === source.index
      ) {
        return;
      }

      const sourceStatus = source.droppableId;
      const destStatus = destination.droppableId;

      // 安全にコピーして不変性を保持
      setPipelines((prev) => {
        const fromList = Array.isArray(prev[sourceStatus])
          ? [...prev[sourceStatus]]
          : [];
        const toList = Array.isArray(prev[destStatus])
          ? [...prev[destStatus]]
          : [];

        const [moved] = fromList.splice(source.index, 1);
        if (!moved) return prev; // safety

        toList.splice(destination.index, 0, moved);

        return {
          ...prev,
          [sourceStatus]: fromList,
          [destStatus]: toList,
        };
      });

      // 非同期でバックエンド更新（失敗時のみ復旧）
      try {
        await authorizedRequest("PUT", `/customers/${draggableId}/status`, {
          status: destStatus,
        });
        // 成功時は何もしない（オプティミスティック更新でUIは既に反映）
      } catch (error) {
        console.error("ステータス更新エラー:", error);
        // エラー時のみ再取得（最小限）
        loadPipelines();
      }
    },
    [loadPipelines]
  );

  /* Skeleton レイアウト（読み込み中でもレイアウト維持してちらつきを抑える） */
  if (loading) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen font-sans">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          セールスパイプライン
        </h1>
        <div className="flex gap-6 overflow-x-auto p-4">
          {STATUSES.map((s) => (
            <div key={s} className="w-72 min-w-72">
              <div className="bg-gray-200 h-8 rounded mb-4 animate-pulse" />
              <div className="space-y-4">
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen font-sans">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        セールスパイプライン
      </h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto p-4">
          {STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              items={pipelines[status] || []}
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
