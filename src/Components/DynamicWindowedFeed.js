import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";

export default function DynamicWindowedFeed({ items, buffer = 5, renderItem }) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [heights, setHeights] = useState({});
  const itemRefs = useRef({});

  // Measure heights after render
  useEffect(() => {
    const newHeights = { ...heights };
    Object.keys(itemRefs.current).forEach((key) => {
      const el = itemRefs.current[key];
      if (el) {
        const height = el.getBoundingClientRect().height;
        if (newHeights[key] !== height) newHeights[key] = height;
      }
    });
    setHeights(newHeights);
  });
  const totalHeight = items.reduce((sum, _, i) => sum + (heights[i] || 200), 0);

  // Compute visible items
  let y = 0;
  let startIndex = 0;
  let endIndex = items.length;
  for (let i = 0; i < items.length; i++) {
    const itemHeight = heights[i] || 200;
    if (y + itemHeight >= scrollTop && startIndex === 0)
      startIndex = Math.max(0, i - buffer);
    if (y > scrollTop + containerHeight) {
      endIndex = Math.min(items.length, i + buffer);
      break;
    }
    y += itemHeight;
  }

  const visibleItems = items.slice(startIndex, endIndex);

  // Compute top offsets
  const topOffsets = [];
  let offset = 0;
  for (let i = 0; i < items.length; i++) {
    topOffsets[i] = offset;
    offset += heights[i] || 200;
  }

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    if (containerRef.current)
      setContainerHeight(containerRef.current.clientHeight);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ overflowY: "auto", height: "100vh", position: "relative" }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, i) => {
          const index = startIndex + i;
          return (
            <div
              key={item.id || index}
              ref={(el) => (itemRefs.current[index] = el)}
              style={{
                position: "absolute",
                top: topOffsets[index],
                left: 0,
                right: 0,
              }}
            >
              {renderItem(index, item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// import React, {
//   useRef,
//   useEffect,
//   useCallback,
//   useState,
//   useMemo,
// } from "react";

// /**
//  * DynamicWindowedFeed
//  *
//  * Props:
//  * - items: array of data
//  * - buffer: number of extra items to keep above/below viewport
//  * - renderItem: (index, item) => ReactNode
//  *
//  * Behavior:
//  * - Renders only visible items + buffer
//  * - Observes each rendered item's height via ResizeObserver
//  * - When an observed item's height changes, it:
//  *    1) updates heightsRef[index]
//  *    2) recomputes cumulative offsets for subsequent items
//  *    3) directly updates style.top on DOM nodes for subsequent items
//  * - Maintains container spacer height to keep scrollbar consistent
//  */
// export default function DynamicWindowedFeed({
//   items,
//   buffer = 5,
//   renderItem,
// }) {
//   const containerRef = useRef(null);
//   const itemNodesRef = useRef({}); // index -> DOM node
//   const heightsRef = useRef([]); // index -> current height (numbers)
//   const offsetsRef = useRef([]); // index -> top offset (numbers)
//   const roRef = useRef(null); // ResizeObserver
//   const rafRef = useRef(null); // for batching updates

//   // visible window indices stored in state to trigger rerender when window slides
//   const [windowRange, setWindowRange] = useState([0, Math.min(items.length, buffer * 3)]);

//   // Measure container size once (and on resize)
//   useEffect(() => {
//     const updateContainerSize = () => {
//       if (!containerRef.current) return;
//       // recompute window when container height or scroll changes externally
//       computeWindowFromScroll(containerRef.current.scrollTop);
//     };

//     updateContainerSize();
//     window.addEventListener("resize", updateContainerSize);
//     return () => window.removeEventListener("resize", updateContainerSize);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [items.length, buffer]);

//   // Helper: compute cumulative offsets from heightsRef
//   const recomputeOffsets = useCallback(() => {
//     const heights = heightsRef.current;
//     const offsets = offsetsRef.current;
//     let acc = 0;
//     for (let i = 0; i < items.length; i++) {
//       offsets[i] = acc;
//       acc += heights[i] || 0;
//     }
//     // return total height
//     return acc;
//   }, [items.length]);

//   // When an item's height changes, call this to update children positions
//   const handleHeightChange = useCallback((changedIndex, newHeight) => {
//     // update heightsRef
//     const heights = heightsRef.current;
//     if (heights[changedIndex] === newHeight) return; // nothing changed

//     heights[changedIndex] = newHeight;

//     // batch update via RAF to reduce layout thrash
//     if (rafRef.current) cancelAnimationFrame(rafRef.current);
//     rafRef.current = requestAnimationFrame(() => {
//       const total = recomputeOffsets(); // updates offsetsRef
//       // update spacer height
//       if (containerRef.current) {
//         const spacer = containerRef.current.querySelector(".__dwf_spacer");
//         if (spacer) spacer.style.height = `${total}px`;
//       }

//       // update top for all rendered items after changedIndex
//       const startToUpdate = Math.max(changedIndex, windowRange[0]);
//       const endToUpdate = Math.min(windowRange[1], items.length);
//       for (let i = startToUpdate; i < endToUpdate; i++) {
//         const node = itemNodesRef.current[i];
//         if (node) {
//           const top = offsetsRef.current[i] || 0;
//           node.style.top = `${top}px`;
//         }
//       }
//     });
//   }, [recomputeOffsets, items.length, windowRange]);

//   // Initialize ResizeObserver once and set callback to update height
//   useEffect(() => {
//     if (typeof ResizeObserver === "undefined") return;

//     roRef.current = new ResizeObserver((entries) => {
//       for (const entry of entries) {
//         const node = entry.target;
//         const idx = node.__dwf_index;
//         if (typeof idx !== "number") continue;
//         const newHeight = Math.round(entry.contentRect.height);
//         handleHeightChange(idx, newHeight);
//       }
//     });

//     return () => {
//       if (roRef.current) roRef.current.disconnect();
//       roRef.current = null;
//     };
//   }, [handleHeightChange]);

//   // Compute window based on scrollTop & container height using cumulative offsets
//   const computeWindowFromScroll = useCallback((scrollTop) => {
//     const container = containerRef.current;
//     if (!container) {
//       setWindowRange([0, Math.min(items.length, buffer * 3)]);
//       return;
//     }
//     const clientHeight = container.clientHeight;

//     // ensure offsetsRef is reasonably initialized
//     if (!offsetsRef.current.length) recomputeOffsets();

//     // find start index: first item whose bottom > scrollTop
//     let start = 0;
//     for (let i = 0; i < items.length; i++) {
//       const top = offsetsRef.current[i] || 0;
//       const height = heightsRef.current[i] || 0;
//       if (top + height > scrollTop) {
//         start = Math.max(0, i - buffer);
//         break;
//       }
//     }

//     // find end index: first item whose top > scrollTop + clientHeight
//     let end = items.length;
//     for (let i = start; i < items.length; i++) {
//       const top = offsetsRef.current[i] || 0;
//       if (top > scrollTop + clientHeight) {
//         end = Math.min(items.length, i + buffer);
//         break;
//       }
//     }

//     // clamp
//     start = Math.max(0, Math.min(start, items.length - 1));
//     end = Math.max(start + 1, Math.min(end, items.length));
//     setWindowRange([start, end]);
//   }, [items.length, buffer, recomputeOffsets]);

//   // scroll handler
//   useEffect(() => {
//     const container = containerRef.current;
//     if (!container) return;
//     let ticking = false;
//     const onScroll = () => {
//       if (!ticking) {
//         ticking = true;
//         requestAnimationFrame(() => {
//           computeWindowFromScroll(container.scrollTop);
//           ticking = false;
//         });
//       }
//     };
//     container.addEventListener("scroll", onScroll);
//     // initial compute
//     computeWindowFromScroll(container.scrollTop);
//     return () => {
//       container.removeEventListener("scroll", onScroll);
//     };
//   }, [computeWindowFromScroll]);

//   // When windowRange changes, ensure the newly rendered nodes are observed and positioned
//   useEffect(() => {
//     // ensure offsets exist for indices in window (create 0 if missing)
//     for (let i = windowRange[0]; i < windowRange[1]; i++) {
//       if (heightsRef.current[i] == null) heightsRef.current[i] = 0;
//       if (offsetsRef.current[i] == null) offsetsRef.current[i] = offsetsRef.current[i] || 0;
//     }

//     // position DOM nodes if present
//     for (let i = windowRange[0]; i < windowRange[1]; i++) {
//       const node = itemNodesRef.current[i];
//       if (node) {
//         node.style.position = "absolute";
//         node.style.left = "0";
//         node.style.right = "0";
//         node.style.top = `${offsetsRef.current[i] || 0}px`;
//         node.__dwf_index = i;
//         // observe node for size changes
//         if (roRef.current) {
//           try {
//             roRef.current.observe(node);
//           } catch (e) {
//             /* ignore */
//           }
//         }
//       }
//     }

//     // clean up observers for nodes that were removed from window
//     // (disconnect will be handled by RO when nodes removed, but we can unobserve)
//     const keys = Object.keys(itemNodesRef.current).map(Number);
//     for (const k of keys) {
//       if (k < windowRange[0] || k >= windowRange[1]) {
//         const node = itemNodesRef.current[k];
//         if (node && roRef.current) {
//           try {
//             roRef.current.unobserve(node);
//           } catch (e) {}
//         }
//         delete itemNodesRef.current[k];
//       }
//     }

//     // update spacer height
//     const total = recomputeOffsets();
//     const spacer = containerRef.current && containerRef.current.querySelector(".__dwf_spacer");
//     if (spacer) spacer.style.height = `${total}px`;
//   }, [windowRange, recomputeOffsets]);

//   // Render: a single spacer DIV sized to total content height, absolute children for visible window
//   const totalHeight = useMemo(() => {
//     // ensure offsets exist
//     recomputeOffsets();
//     const last = offsetsRef.current[items.length - 1] || 0;
//     const lastHeight = heightsRef.current[items.length - 1] || 0;
//     return last + lastHeight;
//   }, [items.length, recomputeOffsets]);

//   return (
//     <div
//       ref={containerRef}
//       style={{ height: "100vh", overflowY: "auto", position: "relative" }}
//     >
//       {/* spacer keeps scroll height */}
//       <div className="__dwf_spacer" style={{ height: `${totalHeight}px`, position: "relative" }} />
//       {/* render window */}
//       {items.slice(windowRange[0], windowRange[1]).map((item, idx) => {
//         const index = windowRange[0] + idx;
//         return (
//           <div
//             key={item.id ?? index}
//             ref={(el) => {
//               if (!el) {
//                 // node removed
//                 if (itemNodesRef.current[index]) {
//                   if (roRef.current) {
//                     try {
//                       roRef.current.unobserve(itemNodesRef.current[index]);
//                     } catch (e) {}
//                   }
//                   delete itemNodesRef.current[index];
//                 }
//                 return;
//               }
//               // attach node
//               itemNodesRef.current[index] = el;
//               // ensure top is set (might be updated later by RO)
//               el.style.position = "absolute";
//               el.style.left = "0";
//               el.style.right = "0";
//               el.style.top = `${offsetsRef.current[index] || 0}px`;
//               el.__dwf_index = index;
//               // measure immediately and set height if needed (kickstart)
//               const measured = Math.round(el.getBoundingClientRect().height);
//               if (heightsRef.current[index] !== measured) {
//                 heightsRef.current[index] = measured;
//                 // update following offsets and children positions in RAF
//                 if (rafRef.current) cancelAnimationFrame(rafRef.current);
//                 rafRef.current = requestAnimationFrame(() => {
//                   const total = recomputeOffsets();
//                   const spacer = containerRef.current && containerRef.current.querySelector(".__dwf_spacer");
//                   if (spacer) spacer.style.height = `${total}px`;
//                   // adjust top of rendered nodes
//                   for (let i = windowRange[0]; i < windowRange[1]; i++) {
//                     const node = itemNodesRef.current[i];
//                     if (node) node.style.top = `${offsetsRef.current[i] || 0}px`;
//                   }
//                 });
//               }
//               // observe for changes
//               if (roRef.current) {
//                 try {
//                   roRef.current.observe(el);
//                 } catch (e) {}
//               }
//             }}
//           >
//             {renderItem(index, item)}
//           </div>
//         );
//       })}
//     </div>
//   );
// }
