import { useState, useEffect } from 'react'
import React from 'react';
import Button from 'react-bootstrap/Button';
import TooltipShell from '/src/TooltipShell.jsx'
function FlexFilter(props) {
    let size = props.option_list.length > 8 ? "sm" : "lg";
    let flex = props.option_list.length > 8 ? "1 0 33%" : "1 0 50%"
    return (
        <>
            <TooltipShell placement={props.tooltip_placement} header={props.tooltip_header}
                body={props.tooltip_body}
                content={(<Button className="headerbtn" size="lg" variant="outline-light">{props.header_label}</Button>)}
            />
            <div className="filterBox">
                {props.option_list.map((value, index) => (

                    <Button key={`filter-${value}-${index}`} size={size} className="togglebtn" variant="outline-success" style={{ flex: flex, fontWeight: "bold", borderRadius: 0 }}
                        active={props.selected_options.includes(value)}
                        onClick={() => {
                            let _selected_options = [...props.selected_options];
                            if (_selected_options.includes(value))
                                _selected_options.splice(_selected_options.indexOf(value), 1);
                            else
                                _selected_options.push(value);
                            props.set_selected_options(_selected_options);

                        }}
                    >
                        {value}
                    </Button>
                ))}
            </div>
        </>
    );
}

export default FlexFilter;