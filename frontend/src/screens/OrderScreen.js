import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { PayPalButton } from 'react-paypal-button-v2'
import { Link } from 'react-router-dom'
import { Row, Col, ListGroup, Image, Card, Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import Message from '../components/Message'
import Loader from '../components/Loader'

import {
  getOrderDetails,
  payOrder,
  deliverOrder,
} from '../actions/orderActions'
import {
  ORDER_PAY_RESET,
  ORDER_DELIVER_RESET,
} from '../constants/orderConstants'

import easyinvoice from 'easyinvoice'

const OrderScreen = ({ match, history }) => {
  const orderId = match.params.id
  
  const [sdkReady, setSdkReady] = useState(false)
  
  const dispatch = useDispatch()

  const orderDetails = useSelector((state) => state.orderDetails)
  const { order, loading, error } = orderDetails
  // console.log(order)


  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  const orderDeliver = useSelector((state) => state.orderDeliver)
  const { loading: loadingDeliver, success: successDeliver } = orderDeliver

  const userLogin = useSelector((state) => state.userLogin)
  const { userInfo } = userLogin
  console.log('userInfo : ' ,userInfo)

  if (!loading) {
    //   Calculate prices
    const addDecimals = (num) => {
      return (Math.round(num * 100) / 100).toFixed(2)
    }

    order.itemsPrice = addDecimals(
      order.orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    )
  }

  useEffect(() => {
    if (!userInfo) {
      history.push('/login')
    }

    const addPayPalScript = async () => {
      const { data: clientId } = await axios.get('/api/config/paypal')
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
      script.async = true
      script.onload = () => {
        setSdkReady(true)
      }
      document.body.appendChild(script)
    }

    if (!order || successPay || successDeliver || order._id !== orderId) {
      dispatch({ type: ORDER_PAY_RESET })
      dispatch({ type: ORDER_DELIVER_RESET })
      dispatch(getOrderDetails(orderId))
    } else if (!order.isPaid) {
      if (!window.paypal) {
        addPayPalScript()
      } else {
        setSdkReady(true)
      }
    }
  }, [dispatch, orderId, successPay, successDeliver, order])

  const successPaymentHandler = (paymentResult) => {
    console.log(paymentResult)
    dispatch(payOrder(orderId, paymentResult))
  }

  const deliverHandler = () => {
    dispatch(deliverOrder(order))
  }

  const invoiceHandler = () =>{
    console.log('invoiceHandler')
    // const easyinvoice = 
  
    var data = {
      "documentTitle": "INVOICE", //Defaults to INVOICE
      //"locale": "de-DE", //Defaults to en-US, used for number formatting (see docs)
      "currency": "INR", //See documentation 'Locales and Currency' for more info
      "taxNotation": "gst", //or gst
      "marginTop": 25,
      "marginRight": 25,
      "marginLeft": 25,
      "marginBottom": 25,
      // "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png", //or base64
      // "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg", //or base64 //img or pdf
      "sender": {
          "company": "eSHOP Shopping Cart",
          "address": "1st Street",
          "zip": "560068",
          "city": "bangalore",
          "country": "India"
          //"custom1": "custom value 1",
          //"custom2": "custom value 2",
          //"custom3": "custom value 3"
      },
      "client": {
           "company": userInfo.name ,
           "address": order.shippingAddress.address,
           "zip": order.shippingAddress.postalCode,
           "city": order.shippingAddress.city,
           "country": order.shippingAddress.country
          //"custom1": "custom value 1",
          //"custom2": "custom value 2",
          //"custom3": "custom value 3"
      },
      "invoiceNumber": order._id,
      "invoiceDate": order.paidAt,
      "products":
        order.orderItems.map((items) =>{
          return{
            "quantity":items.qty,
            "description": items.name ,
            "tax": 18,
            "price": items.price
          }
        }),
      //  [
      //     {
      //       "quantity":order.orderItems[0].qty,
      //       "description": order.orderItems[0].name ,
      //       "tax": 21,
      //       "price": order.orderItems[0].price
      //     },
      //     {
      //         "quantity": "4",
      //         "description": "Test2",
      //         "tax": 21,
      //         "price": 1901
      //     }
      // ],

      "bottomNotice":  (order.isPaid ? `Payment Done!! At : ${order.paidAt}` : 'Payment Pending............'),
      //Used for translating the headers to your preferred language
      //Defaults to English. Below example is translated to Dutch
      // "translate": { 
      //     "invoiceNumber": "Factuurnummer",
      //     "invoiceDate": "Factuurdatum",
      //     "products": "Producten", 
      //     "quantity": "Aantal", 
      //     "price": "Prijs",
      //     "subtotal": "Subtotaal",
      //     "total": "Totaal" 
      // }
  };
  
  //Create your invoice! Easy!
  easyinvoice.createInvoice(data, function (result) {
      easyinvoice.download('invoice.pdf')
  });
  }


  return loading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error}</Message>
  ) : (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong>{' '}
                <a href={`mailto:${order.user.email}`}>{order.user.email}</a>
              </p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on {order.deliveredAt}
                </Message>
              ) : (
                <Message variant='light'>Delivering Soon...</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Payment Method</h2>
              <p>
                <strong>Method: </strong>
                {order.paymentMethod}
              </p>
              {order.isPaid ? (
                <Message variant='success'>Paid on {order.paidAt}</Message>
              ) : (
                <Message variant='secondary'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item>
              <h2>Order Items</h2>
              {order.orderItems.length === 0 ? (
                <Message>Order is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {order.orderItems.map((item, index) => (
                    <ListGroup.Item key={index}>
                      <Row>
                        <Col md={1}>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <Link to={`/product/${item.product}`}>
                            {item.name}
                          </Link>
                        </Col>
                        <Col md={4}>
                          {item.qty} x &#8377; {item.price} = &#8377; {item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>&#8377; {order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>&#8377; {order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>&#8377; {order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>&#8377; {order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <PayPalButton
                      amount={order.totalPrice}
                      onSuccess={successPaymentHandler}
                    />
                  )}
                </ListGroup.Item>
              )}
              {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
          {order.isPaid &&
          <Button variant='primary' onClick={invoiceHandler} className='mt-3'>Download Invoice</Button>}
        </Col>
      </Row>
    </>
  )
}

export default OrderScreen
