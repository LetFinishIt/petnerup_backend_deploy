const express = require('express');
const router = express.Router();

// import user controllers
const petControllers = require('../controllers/pet');

// PET ROUTES
router.post('/getPetById', petControllers.getPetById);

router.post('/addNewPet', petControllers.addNewPet);

router.post('/addPetToFamily', petControllers.addPetToFamily);

router.post('/updatePetInfo', petControllers.updatePetInfo);

router.post('/updatePetProfileImage', petControllers.updatePetProfileImage);

router.post('/deletePetProfile', petControllers.deletePetProfile);

module.exports = router;
