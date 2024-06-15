import React, { useState } from 'react';
import Stack from 'react-bootstrap/Stack';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Ratio from 'react-bootstrap/Ratio';
import Form from 'react-bootstrap/Form';
function CustomCount(props) {
    let inverted = props.inverted;
    const buttonStyle = {
        "fontSize": "1rem",
        "boxSizing": "border-box",
        padding: 0,
        display: "inline-block",
        flex: `1 1 50%`,
        borderRadius: "0",
        lineHeight: 0,
        margin: 0,
        opacity: "100%",
        border: "1px solid black"

    };
    let count_style = { ...buttonStyle };
    count_style["cursor"] = "default";
    count_style["flex"] = `1 0 ${200.0 / 3.0}%`;
    count_style["fontSize"] = "2rem";
    return (
        <Ratio aspectRatio={inverted ? 150 : 75} style={{ minWidth: "60px" }}>
            <Stack className="outerCountBox" direction={inverted ? "vertical" : "horizontal"} style={{ overflow: "hidden", borderRadius: "10px" }}>
                <Ratio aspectRatio={100} style={{ flex: `2 0 ${200.0 / 3.0}%` }}>
                    <Button
                        size={props.size}
                        variant="dark"
                        active
                        style={count_style}
                        as="label"
                    >
                        <Form.Control className="countBox" type="number" value={props.count} min={0} max={props.max}
                            onChange={(e) => props.updateCount(props.name, Math.min(Math.max(e.target.value, 0), props.max))} />
                    </Button>
                </Ratio>
                <Ratio aspectRatio={inverted ? 50 : 200} style={{ flex: `1 0 ${100.0 / 3.0}%` }}>
                    <ButtonGroup vertical={!inverted}>
                        <Button
                            style={buttonStyle}
                            variant={inverted ? "danger" : "success"}
                            onClick={() => props.updateCount(props.name, parseInt(props.count) + (inverted ? -1 : 1))}
                            disabled={inverted ? props.count <= 0 : props.count >= props.max}
                            className={inverted ? "minusbtn" : "plusbtn"}
                        >{inverted ? "-" : "+"}</Button>
                        <Button
                            style={buttonStyle}
                            variant={inverted ? "success" : "danger"}
                            onClick={() => props.updateCount(props.name, parseInt(props.count) - (inverted ? -1 : 1))}
                            disabled={inverted ? props.count >= props.max : props.count <= 0}
                            className={inverted ? "plusbtn" : "minusbtn"}
                        >{inverted ? "+" : "-"}</Button>
                    </ButtonGroup>
                </Ratio>

            </Stack>
        </Ratio>
    );
}

export default CustomCount;