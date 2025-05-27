import { Tooltip } from "react-tooltip";
import './CustomTooltip.css'

const CustomTooltip = () => {
    return (
        <Tooltip
            id="tooltip"
            place="bottom"
            effect="solid"
            delayShow={200}
            className="custom-tooltip"
        />
    )
}

export default CustomTooltip;