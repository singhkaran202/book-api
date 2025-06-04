const express=require('express');
const router=express.Router();
const auth=require('../middleware/auth');
const Book=require('../models/Book');
const Review=require('../models/Review');
//Add a new book
router.post('/',auth,async(req,res)=>{
    try{
        const book=new Book(req.body);
        await book.save();
        res.status(201).json(book);

    }
    catch(err){
        res.status(400).json({error:err.message});
    }
});
// Get all books with optional filters & pagination
router.get('/',async(req,res)=>{
    const {page=1,limit=10,author,genre}=req.query;
    const query={};
    if (author) query.author=new RegExp(author,'i');
    if (genre) query.genre=genre;
    const books=await Book.find(query)
      .skip((page-1)*limit)
      .limit(Number(limit));
    res.json(books);
});
// Get book details by ID (with average rating & reviews)
router.get('/:id',async(req,res)=>{
    const book=await Book.findById(req.params.id).populate({
        path:'reviews',
        options:{limit:5}
    });
    if(!book) return res.status(404).json({error:'Book not found'}); 
    //calculate average rating
    const avgRating=book.reviews.reduce((sum,r)=>sum+r.rating,0)/(book.reviews.length || 1);
    book.averageRating=avgRating;
    res.json(book);
   
});
router.get('/search',async(req,res)=>{
    const {query}=req.query;
    const books=await Book.find({
        $or:[
            {
                title:new RegExp(query,'i')

            },
            {
                author:new RegExp(query,'i')
            }
        ]
    });
    res.json(books);
});
module.exports=router;