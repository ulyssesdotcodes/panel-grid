import {LitElement, css, html} from "lit";
import {styleMap} from 'lit/directives/style-map.js';
            // [`border-${resizeBar.position}`]: resizeBorderStyle,

@customElements('panel')
export class Panel extends LitElement{
  protected protected render(): unknown {
      return html`
        <div
          style=${styleMap({
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "0.8em",
            gap: "0.4em",
            gridArea,
            ...style,
          })}
        >
          <div
            style=${styleMap({
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flexBasis: "2em",
              gap: "0.4em",
              ...titleStyle,
            })}
          >
            {collapsedSize && resizeBar.position === "right" && (
              <div
                ref={iconRef}
                style={{ display: "flex", flex: "0 0 auto" }}
                onClick={() =>
                  wrapperRect &&
                  titleRect &&
                  iconRect &&
                  panelGridContext.minimize(
                    gridArea,
                    gridTemplateSizeFromString(collapsedSize),
                  )
                }
              >
                {isMinimized ? collapsedIcon : expandedIcon}
              </div>
            )}
            {(!isMinimized ||
              resizeBar?.position === "top" ||
              resizeBar?.position === "bottom") && (
              <div
                style={{
                  flexGrow: 1,
                  ...(isMinimized && styles.titleCollapsed),
                  ...styles.title,
                }}
              >
                {title}
              </div>
            )}
            {collapsedSize && resizeBar.position !== "right" && (
              <div
                ref={iconRef}
                style={{ display: "flex", flex: "0 0 auto" }}
                onClick={() =>
                  wrapperRect &&
                  titleRect &&
                  iconRect &&
                  panelGridContext.minimize(
                    gridArea,
                    gridTemplateSizeFromString(collapsedSize),
                  )
                }
              >
                {isMinimized ? collapsedIcon : expandedIcon}
              </div>
            )}
          </div>
          <div
            style={{
              flexBasis: "0px",
              flexGrow: 1,
              flexShrink: 1,
              display: isMinimized ? "none" : "block",
              overflowY: "clip",
            }}
          >
            {children}
          </div>
        </div>
      `
  }

}

  PropsWithChildren<{
    gridArea: string;
    title?: ReactNode;
    collapsedSize: string;
    collapsedIcon?: ReactNode;
    expandedIcon?: ReactNode;
    resizeBorderStyle?: string;
    style?: CSSProperties;
    titleStyle?: CSSProperties;
  }>
> = ({
  children,
  title,
  gridArea,
  collapsedSize,
  collapsedIcon,
  expandedIcon,
  resizeBorderStyle = "1px solid rgba(0, 0, 0, 0.12)",
  style,
  titleStyle,
}) => {
  const panelGridContext = useContext(PanelGridContext);
  const [wrapperRect, setWrapperRect] = useState<DOMRect>();
  const [titleRect, setTitleRect] = useState<DOMRect>();
  const [iconRect, setIconRect] = useState<DOMRect>();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  const isMinimized = panelGridContext.minimizedAreas.includes(gridArea);
  const resizeBar = panelGridContext.findResizeBar(gridArea);

  useLayoutEffect(() => {
    if (wrapperRef.current) {
      setWrapperRect(wrapperRef.current.getBoundingClientRect());
    }
    if (titleRef.current) {
      setTitleRect(titleRef.current.getBoundingClientRect());
    }
    if (iconRef.current) {
      setIconRect(iconRef.current.getBoundingClientRect());
    }
  }, []);

  return resizeBar ? (
  ) : (
    <>{children}</>
  );
};

