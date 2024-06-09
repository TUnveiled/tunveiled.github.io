import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
import Stack from 'react-bootstrap/Stack';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

function CardComponent(props) {
    const [isHovered, setHover] = useState(false);
    let mouse_connected = matchMedia('(pointer:fine)').matches;
    const buttonStyle = {
        "fontSize": props.size == "sm" ? "1.5vh" : "3vh",
        "height": props.size == "sm" ? "3vh" : "6vh",
        "width": props.size == "sm" ? "3vh" : "6vh",
        "boxSizing": "border-box",
        padding: 0,
        display: isHovered || !mouse_connected ? "inline-block" : "none"
    };
    let count_style = { ...buttonStyle };
    count_style["cursor"] = "default";
    count_style["display"] = !mouse_connected || isHovered || props.count > 0 && props.size == "lg" ? "inline-block" : "none";
    let menu_style = {
        width: "100%",
        position: "absolute",
        bottom: "5px",
    }
    let countComponent = (<Button className="mx-auto"
        size={props.size}
        variant="dark"
        active
        style={count_style}
        disabled={!isHovered}
    >
        {props.count}
    </Button>);
    return (
        <div className="imageContainer">
            <OverlayTrigger hidden placement="auto" trigger={ mouse_connected ? "hover" : "focus" }
                onToggle={(nextShow) => setHover(nextShow)}
                overlay={ (props.size == "sm") ? (
                <Popover>
                    <Popover.Body>
                        <Image style={{ maxWidth: "100%" }} src={props.src} />

                    </Popover.Body>
                    </Popover>
                ) : <></>
            }>
                <div>
                    <Image style={{ maxWidth: "100%" }} src={props.src} />
                    <Stack direction="horizontal" gap={0} style={menu_style}>
                        <Button 
                            size={props.size}
                            style={buttonStyle}
                            variant="danger"
                            onClick={() => props.updateCount(props.name, parseInt(props.count) - 1)}
                            disabled={props.count <= 0 }
                        >
                            -
                        </Button>
                        {countComponent}
                        <Button 
                            size={props.size}
                            style={buttonStyle}
                            variant="success"
                            onClick={() => props.updateCount(props.name, parseInt(props.count) + 1)}
                            disabled={props.count >= props.max}
                        >
                            +
                        </Button>
                    </Stack>
                </div>
            </OverlayTrigger>
        </div>
    );
}

export default CardComponent;