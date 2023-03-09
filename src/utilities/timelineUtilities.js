export function playPositionToFormat(seconds) {
    const date = new Date();
    date.setTime(seconds * 1000);
    return (
        date.toLocaleTimeString("en-US", {
            hour12: false,
            minute: "2-digit",
            second: "2-digit",
        }) +
        (date.getMilliseconds() !== 0
            ? ":" + (date.getMilliseconds() + 1000).toString().slice(1)
            : "")
    );
}
