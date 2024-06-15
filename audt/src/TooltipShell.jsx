import React, { useState } from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
function TooltipShell(props) {
  return (
      <OverlayTrigger placement={props.placement ?? "auto"} overlay={
          <Popover>
              {props.header && <Popover.Header><h4>{props.header ?? ""}</h4></Popover.Header>}
              {props.body && <Popover.Body>{props.body ?? ""}</Popover.Body>}
          </Popover>
      }>
          {props.content ?? ""}
      </OverlayTrigger>
  );
}

export default TooltipShell;