import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

const Footer = () => {
  return (
    <footer>
      <Container className='bg-dark' >
        <Row style={{color:'white'}} >
          <Col className='text-center py-3 dark'>Copyright &copy; eSHOP</Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer;
