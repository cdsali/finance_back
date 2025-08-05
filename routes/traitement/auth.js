const express = require('express');
const router = express.Router();

const fn = require('../../models/traitement/auth'); 
const jwt = require('jsonwebtoken');
const { verifyAccessType,verifyToken, verifyAccessType2 } = require('../../middlewares/authmiddleware');




router.post('/login', async function (req, res) {
    const { username, password } = req.body;
  
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }
  
    fn.AuthenticateUser(username, password, async function (err, user) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Authentication error', error: err });
        }
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

      
        const token = jwt.sign(
            {
                userId: user.id,
                userRole: user.role,
                userDr: user.dr,
                userName:user.name

            },
            process.env.JWT_SECRET,
            { expiresIn: '6h' }
        );

        try {
           
            //await fn.UpdateLastLogin(user.id);
           // await fn.CreateSession(user.id);

          
            res.json({
                success: true,
                message: 'Login successful',
                token,
               userId: user.id,
                userRole: user.role,
                UserDr: user.dr,
                 userName:user.name
            });
        } catch (updateError) {
            return res.status(500).json({ success: false, message: 'Eror updating last login', error: updateError });
        }
    });
});


  
  


router.get('/session',verifyToken, verifyAccessType2, function (req, res) {
  fn.getSessions(function (err, sessions) {
    if (err) {
      console.error('Erreur lors de la récupération des sessions:', err);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des sessions',
        error: err.message || err,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sessions récupérées avec succès',
      data: sessions,
    });
  });
});


module.exports = router;
