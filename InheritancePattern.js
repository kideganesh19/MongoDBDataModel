db.books.updateOne(
    {_id:1},
    [
        {
            $set:{
                product_type:"book",
                description:"$details"
            }
        },
        {
            $unset:"details"
        }
    ]
)

db.books.updateOne(
    {_id:2},
    [
        {
            $set:{
                product_type:"ebook",
                product_id:"44538756",
                authors:{$cond:[{ $isArray:"$authors" }, "$authors", [ "$authors" ]]},
                description:"$desc"
            }
        },
        {
            $unset:"desc"
        }
    ]
)

db.books.updateOne(
    {_id:2},
    [
        {
            $set:{
                authors:[ "Shannon Bradshaw", "Eoin Brazil", "Christina Chodorow" ]
            }
        }
    ]
)

db.books.updateOne(
    {_id:3},
    [
        {
            $set:{
                product_type:"audiobook",
                description:"$desc"
            }
        },
        {
            $unset:"desc"
        }
    ]
)

db.books.updateOne(
    {_id:3},
    [
        {
            $set:{
               authors:{$cond:[{ $isArray:"$authors" }, "$authors", [ "$author" ]]}
            }
        }
    ]
)

db.books.updateOne(
    {_id:3},
    [
        {
            $unset:"author"
        }
    ]
)