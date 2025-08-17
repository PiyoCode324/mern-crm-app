// src/components/TaskList.jsx
import React from "react";
import TaskCard from "./TaskCard";

const TaskList = ({
  tasks,
  users,
  customers,
  sales,
  onEdit,
  onDelete,
  currentUserUid, // ★ currentUserUid を受け取る
  onTaskAction,
  onViewDetails,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            users={users}
            customers={customers}
            sales={sales}
            currentUserUid={currentUserUid} // ★ TaskCardに渡す
            onTaskAction={onTaskAction}
            onViewDetails={onViewDetails}
          />
        ))
      ) : (
        <p className="text-gray-500 italic">タスクはありません。</p>
      )}
    </div>
  );
};

export default TaskList;
