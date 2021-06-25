import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import './SearchBox.css';

const SearchBox = ({ history }) => {
  const [keyword, setKeyword] = useState('')

  const submitHandler = (e) => {
    e.preventDefault()
    if (keyword.trim()) {
      history.push(`/search/${keyword}`)
    } else {
      history.push('/')
    }
  }

  return (
    <Form onSubmit={submitHandler} className="d-flex m-3 searchbox" variant='light' >
      <Form.Control
    
        type='text'
        name='q'
        onChange={(e) => setKeyword(e.target.value)}
        placeholder='Search Products...'
        className='mr-sm-2 ml-sm-5 ml-5n '
      ></Form.Control>
      <Button type='submit' variant='success' className='button'>
        Search
      </Button>
    </Form>
    // <Form onSubmit={submitHandler} className="d-flex m-3">
    //   <Form.Control
    //     type="text"
    //     name='q'
    //     onChange={(e) => setKeyword(e.target.value)}
    //     placeholder="Search"
    //     className="mr-2"
    //     // aria-label="Search"
    //   />
    //   <Button variant="success">Search</Button>
    // </Form>
  )
}

export default SearchBox
