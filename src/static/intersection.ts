let
    observer: IntersectionObserver = undefined,
    prev: string = undefined;

function initObserver(): void {
    observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const eventName = entry.isIntersecting ? "enterView" : "exitView"
            entry.target.dispatchEvent(new CustomEvent(eventName))
        })
    }, {
        root: document.getElementsByClassName("main")[0],
        rootMargin: "-30% 0px -50% 0px"
    })
}

export default function view(element): any {
    if (!observer) initObserver()

    observer.observe(element)
    return {
        destroy() { observer.unobserve(element) }
    }
}

export function updateView(event: MouseEvent | KeyboardEvent | CustomEvent): void {
    let block = (event.target as HTMLElement).closest(".section-title");
    if (!block)
        block = (event.target as HTMLElement).closest(".page-title");
    else if (!block && event.type !== "enterView") return;

    const pathname = window.location.pathname,
        newPathname = pathname.endsWith("docs") ? "/docs/welcome" : pathname,
        previous = document.getElementById(prev),
        selectedId = event.type === "enterView"
            ? `${newPathname}-${(event.target as HTMLElement).getAttribute("id")}`.replace(/[\/#?]/g, "-")
            : block.getAttribute("id"),
        selected = document.getElementById(selectedId);

    prev = selectedId;
    previous?.classList.toggle("active");
    selected?.classList.toggle("active");
}

export function forceUpdatePrev(previd: string): void {
    prev = previd
}