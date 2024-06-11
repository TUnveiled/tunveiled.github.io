import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
function TooltipShell(props) {
  return (
      <OverlayTrigger placement={props.placement ?? "auto"} overlay={
          (<Popover>
              <Popover.Header><h4>{props.header ?? ""}</h4></Popover.Header>
              <Popover.Body>
                  {props.body ?? ""}
              </Popover.Body>
          </Popover>)}>
          {props.content ?? (<div></div>)}
      </OverlayTrigger>
  );
}

export default TooltipShell;