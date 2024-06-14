import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Image from 'react-bootstrap/Image';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Ratio from 'react-bootstrap/Ratio';
function CardComponent(props) {
    const [isHovered, setHover] = useState(false);
    let mouse_connected = matchMedia('(pointer:fine)').matches;
    const buttonStyle = {
        "fontSize": props.size == "sm" ? "0.9em" : "1.4em",
        "boxSizing": "border-box",
        padding: 0,
        display: isHovered || !mouse_connected ? "inline-block" : "none",
        flex: `1 0 ${100.0 / 3.0}%`
    };
    let count_style = { ...buttonStyle };
    count_style["cursor"] = "default";
    count_style["display"] = !mouse_connected || isHovered || props.count > 0 && props.size == "lg" ? "inline-block" : "none";
    count_style["flex"] = `0 1 ${100.0 / 3.0}%`;
    let ratio_style = {
        position: "absolute",
        bottom: "5px",
        zIndex: 5,
        justifyContent: "center",
        width: props.size == "sm" ? "98%" : "68%",
        left: props.size == "sm" ? "1%" : "16%",
        right: props.size == "sm" ? "1%" : "16%",
    }
    let menu_style = {
        flex: "1 0 auto",
        display: "flex",
        flexFlow: "row nowrap",
        justifyContent: "center"
    }
    return (
        <div className="imageContainer">
            <OverlayTrigger hidden placement="auto" trigger={mouse_connected ? "hover" : "focus"}
                onToggle={(nextShow) => setHover(nextShow)}
                overlay={(props.size == "sm") ? (
                    <Popover>
                        <Popover.Body>
                            <Image style={{ maxWidth: "100%" }} src={props.src} />
                        </Popover.Body>
                    </Popover>
                ) : <></>
                }>
                <div style={{ display: "flex", flexFlow: "row wrap", alignContent: "stretch", flex: "1 0 auto" } }>
                    <Image style={{ maxWidth: "100%" }} src={props.src} />
                    <Ratio aspectRatio={1 / 3} style={ratio_style}>
                        <ButtonGroup style={menu_style}>
                            {(isHovered || !mouse_connected) && <Button
                                size={props.size}
                                style={buttonStyle}
                                variant="danger"
                                onClick={() => props.updateCount(props.name, parseInt(props.count) - 1)}
                                disabled={props.count <= 0}
                                className="minusbtn"
                            >-</Button>}
                            <Button 
                                size={props.size}
                                variant="dark"
                                active
                                style={count_style}
                                disabled={!isHovered}
                            >
                                {props.count}
                            </Button>
                            {(isHovered || !mouse_connected) && <Button
                                size={props.size}
                                style={buttonStyle}
                                variant="success"
                                onClick={() => props.updateCount(props.name, parseInt(props.count) + 1)}
                                disabled={props.count >= props.max}
                                className="plusbtn"
                            >+</Button>}
                        </ButtonGroup>
                    </Ratio>
                </div>
            </OverlayTrigger>
        </div>
    );
}

export default CardComponent;