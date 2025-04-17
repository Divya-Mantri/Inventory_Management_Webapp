// // Get a single product by ID
router.get('/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM inventory WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching product:', err);
        res.status(500).json({ error: 'Internal server error' });
      } else if (!row) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.json(row);
      }
    });
  });
  