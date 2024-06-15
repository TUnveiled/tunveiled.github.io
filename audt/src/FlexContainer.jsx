import { useState, useEffect } from 'react'
import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
function FlexContainer(props) {
    let elements = props.elements;
    function xl(index) {
        return Array.isArray(props.xl) ? props.xl[index] : props.xl;
    }
    function lg(index) {
        return Array.isArray(props.lg) ? props.lg[index] : props.lg;
    }
    function md(index) {
        return Array.isArray(props.md) ? props.md[index] : props.md;
    }
    function sm(index) {
        return Array.isArray(props.sm) ? props.sm[index] : props.sm;
    }
    function xs(index) {
        return Array.isArray(props.xs) ? props.xs[index] : props.xs;
    }
    return (
        <Container fluid className={props.className}>
          <Row>
                {elements.map((value, i) => (
                    <Col xl={xl(i)} lg={lg(i)} md={md(i)} sm={sm(i)} xs={xs(i)}>
                        {value}
                    </Col>
                ))}
          </Row>
      </Container>
  );
}

export default FlexContainer;