import React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const DraggableComp = ({
  children = [],
  setNewOrderedList,
  component: Component,
  props,
  background = true,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = children.findIndex((item) => item.id === active.id);
    const newIndex = children.findIndex((item) => item.id === over.id);

    setNewOrderedList(arrayMove(children, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={children.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="fit-container fx-centered fx-start-h fx-start-v fx-col"
          style={{
            borderRadius: "var(--border-r-18)",
            transition: ".2s ease-in-out",
            height: "100%",
          }}
        >
          {children.map((item,index) => (
            <SortableItem
              key={item.id}
              id={item.id}
              item={item}
              Component={Component}
              props={props}
              background={background}
              index={index}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

const SortableItem = ({ id, item, Component, props, background , index}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    willChange: "transform",
    borderRadius: "var(--border-r-18)",
    boxShadow: isDragging
      ? "14px 12px 105px -41px rgba(0, 0, 0, 0.55)"
      : "",
    overflow: "visible",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`fit-container ${
        background ? "fx-scattered sc-s-18 box-pad-h-s box-pad-v-s" : ""
      }`}
    >
      <Component {...props} item={item} index={index}/>
    </div>
  );
};
