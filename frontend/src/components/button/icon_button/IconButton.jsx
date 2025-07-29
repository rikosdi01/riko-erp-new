import './IconButton.css';

const IconButton = ({
    tooltipLabel,
    icon,
    onclick,
    background = "#e4e4e4",
    color = "black",
    padding = "10px",
}) => {
    return (
        <button
            className="icon-button"
            data-tooltip-id="tooltip"
            data-tooltip-content={tooltipLabel}
            onClick={onclick}
            style={{
                background: background,
                color: color,
                padding: padding,
            }}
        >
            {icon}
        </button>
    )
}

export default IconButton;