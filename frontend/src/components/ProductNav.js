import React, {useState} from 'react'
import { useSelector } from 'react-redux'
import { Row, Col,  Container, Image } from 'react-bootstrap'
import {navData} from '../navData/navData.js'
import { Box, Typography, makeStyles } from '@material-ui/core'

const styles = makeStyles({
  mainContainer : {
    display : 'flex',
    margin : 'px 130px',
    justifyContent:'space-between'
  },
  container:{
    textAlign: 'center',
    padding:'12px 8px',
    maxWidth:'fit-content'

  },
  image:{
    width:'100%'
  },
  text:{
    fontFamily : 'arial',
    fontWeight:200,
    textAlign:'center',
    // size:'100%',
    fontSize:'100%',
    width :'fit-content'
    // maxWidth:'fit-content'
    // [breakpoints.down("xs")]: {
    //   fontSize: "3rem"
    // }
    
  }



})



const ProductNav = () => {
  const data = useSelector(state => state.productList)
  console.log(data)

  const clickImg = () => {
    console.log('clickimage')
  }

  const classes = styles()
  return (
    <Container sm="1">
    <Box className={classes.mainContainer}>
      {navData.map((items, key) => (
        <Col sm={1} xs={1} key={key}  classname={classes.container}>
          
          <img src={items.url} className={classes.image} onClick={clickImg} />
          <h2 className={classes.text}>{items.text}</h2>
  
        </Col>
      ))}
    </Box>
    </Container>
  )
}

export default ProductNav
