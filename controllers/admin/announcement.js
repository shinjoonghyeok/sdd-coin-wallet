/**
 * GET /
 * Announcement Page.
 */
exports.getAnnouncement = ( req, res, next ) => {
  res.render( 'admin/announcement', {
    page_name: 'announcement',
    page_title: 'Announcement'
  } );
};
