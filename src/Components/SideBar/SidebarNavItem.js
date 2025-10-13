export function SidebarNavItem({ isActive, children, ...props }) {
  return (
    <div
      className={`pointer fit-container fx-start-h fx-centered box-pad-h-s box-pad-v-s ${isActive ? "active-link" : "inactive-link"}`}
      {...props}
    >
      {children}
    </div>
  );
}
