const asyncHandler = require("express-async-handler");
const {OK}  = require('../../utils/statuscodes')
const productsCLTN = require('../../modles/admin/productModal')
const categoryCLTN = require('../../modles/admin/categoryModal')
const offerCLTN = require('../../modles/admin/offer')
const mongoose = require('mongoose')
const productVariantsCLTN = require('../../modles/admin/productsVariantsMd');



// Controller logic to handle pagination filter sorting

exports.view = asyncHandler(async (req, res) => {
    const categoryId = req.query.category;
    const sortBy = req.query.sortBy || 'priceAsc';
    const searchQuery = req.query.search || null;
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const limit = parseInt(req.query.limit) || 8;

    // Fetch all categories and filter them into men and women arrays
    const categories = await categoryCLTN.find({}).populate('parent');
    let men = [];
    let women = [];

    categories.forEach((category) => {
        if (category.parent && category.parent.name === 'Men' && category.is_delete === false) {
            men.push(category);
        } else if (category.parent && category.parent.name === 'Women' && category.is_delete === false) {
            women.push(category);
        }
    });

    // Define sorting criteria based on sortBy parameter
    let sortCriteria = {};

    switch (sortBy) {
        case 'priceAsc':
            sortCriteria = { 'firstVariant.prices': 1 }; // Sort by first price ascending
            break;
        case 'priceDesc':
            sortCriteria = { 'firstVariant.prices': -1 }; // Sort by first price descending
            break;
        case 'popularity':
            sortCriteria = { 'firstVariant.popularity': -1 }; // Assuming popularity is a valid field
            break;
        case 'newArrivals':
            sortCriteria = { createdDate: -1 }; // Sort by creation date descending
            break;
        case 'az':
            sortCriteria = { name: 1 }; // Sort by product name A-Z
            break;
        case 'za':
            sortCriteria = { name: -1 }; // Sort by product name Z-A
            break;
        default:
            sortCriteria = {}; // No specific sorting
            break;
    }

    let products = [];

    if (categoryId) {
        // Build the aggregation pipeline
        const pipeline = [
            {
                $match: {
                    categoryId: new mongoose.Types.ObjectId(categoryId),
                    is_deleted: false
                }
            },
            {
                $lookup: {
                    from: 'productsvariants',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'Variants'
                }
            },
            {
                $addFields: {
                    firstVariant: {
                        $arrayElemAt: [{
                            $filter: {
                                input: '$Variants',
                                as: 'variant',
                                cond: { $eq: ['$$variant.is_delete', false] }
                            }
                        }, 0]
                    }
                }
            },
            {
                $project: {
                    Variants: 0
                }
            }
        ];

        // Apply search filter if provided
        if (searchQuery) {
            pipeline.push({
                $match: {
                    name: { $regex: searchQuery, $options: 'i' }
                }
            });
        }

        // Add the $sort stage only if sortCriteria is not null
        if (Object.keys(sortCriteria).length > 0) {
            pipeline.push({
                $sort: sortCriteria
            });
        }

        // Count total documents for pagination
        const totalDocumentsPipeline = [...pipeline, { $count: "total" }];
        const totalDocumentsResult = await productsCLTN.aggregate(totalDocumentsPipeline);
        const totalDocuments = totalDocumentsResult.length > 0 ? totalDocumentsResult[0].total : 0;

        // Add $skip and $limit stages for pagination
        pipeline.push(
            { $skip: (page - 1) * limit },
            { $limit: limit }
        );

        try {
            // Execute the aggregation
            products = await productsCLTN.aggregate(pipeline);

            // Manually populate the 'offer' field
            products = await Promise.all(products.map(async product => {
                if (product.offer) {
                    const offer = await offerCLTN.findById(product.offer).lean();
                    product.offer = offer;
                }
                return product;
            }));

            // Render the EJS template with products, pagination data, and other necessary variables
            res.status(200).render('index/partials/productListing', {
                products,
                categoryId,
                men,
                women,
                sortBy,
                page,           // Pass page as currentPage to the template
                limit,
                totalDocuments,
                searchQuery
            });
        } catch (error) {
            console.error('Error during product aggregation:', error);
            res.status(500).send('Server Error');
        }
    } else {
        try {
            // Fetch all products that are not deleted
            const pipeline = [
                {
                    $match: {
                        is_deleted: false
                    }
                },
                {
                    $lookup: {
                        from: 'productsvariants',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'Variants'
                    }
                },
                {
                    $addFields: {
                        firstVariant: {
                            $arrayElemAt: [{
                                $filter: {
                                    input: '$Variants',
                                    as: 'variant',
                                    cond: { $eq: ['$$variant.is_delete', false] }
                                }
                            }, 0]
                        }
                    }
                },
                {
                    $project: {
                        Variants: 0
                    }
                }
            ];

            // Apply search filter if provided
            if (searchQuery) {
                pipeline.push({
                    $match: {
                        name: { $regex: searchQuery, $options: 'i' }
                    }
                });
            }

            // Add the $sort stage only if sortCriteria is not null
            if (Object.keys(sortCriteria).length > 0) {
                pipeline.push({
                    $sort: sortCriteria
                });
            }

            // Count total documents for pagination
            const totalDocumentsPipeline = [...pipeline, { $count: "total" }];
            const totalDocumentsResult = await productsCLTN.aggregate(totalDocumentsPipeline);
            const totalDocuments = totalDocumentsResult.length > 0 ? totalDocumentsResult[0].total : 0;

            // Add $skip and $limit stages for pagination
            pipeline.push(
                { $skip: (page - 1) * limit },
                { $limit: limit }
            );

            // Execute the aggregation
            products = await productsCLTN.aggregate(pipeline);

            // Manually populate the 'offer' field
            products = await Promise.all(products.map(async product => {
                if (product.offer) {
                    const offer = await offerCLTN.findById(product.offer).lean();
                    product.offer = offer;
                }
                return product;
            }));

            // Render the EJS template with products, pagination data, and other necessary variables
            res.status(200).render('index/partials/productListing', {
                products,
                categoryId: null,
                men,
                women,
                sortBy,
                page,           // Pass page as currentPage to the template
                limit,
                totalDocuments,
                searchQuery
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Server Error');
        }
    }
});




