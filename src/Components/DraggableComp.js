import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

export const DraggableComp = ({
  children = [],
  setNewOrderedList,
  component: Component,
  props,
  background = true,
}) => {
  const handleDragEnd = (res) => {
    if (!res.destination) return;
    let tempArr = structuredClone(children);
    let [reorderedArr] = tempArr.splice(res.source.index, 1);
    tempArr.splice(res.destination.index, 0, reorderedArr);
    setNewOrderedList(tempArr);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="set-carrousel">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            style={{
              borderRadius: "var(--border-r-18)",
              transition: ".2s ease-in-out",
              height: "100%",
              ...provided.droppableProps.style,
            }}
            className="box-pad-v-m fit-container fx-centered fx-start-h fx-start-v fx-col"
          >
            {children.map((item, index) => {
              return (
                <Draggable key={index} draggableId={`${index}`} index={index}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      style={{
                        borderRadius: "var(--border-r-18)",
                        boxShadow: snapshot.isDragging
                          ? "14px 12px 105px -41px rgba(0, 0, 0, 0.55)"
                          : "",
                        ...provided.draggableProps.style,
                        overflow: "visible",
                      }}
                      className={`fit-container ${
                        background
                          ? "fx-scatteredsc-s-18 box-pad-h-s box-pad-v-s"
                          : ""
                      }`}
                    >
                      <Component {...props} item={item} />
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
