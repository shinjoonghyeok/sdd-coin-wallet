/**
 * GET /
 * Grand Derby Holdem Masters page.
 */
exports.getGrandDerbyHoldemMasters = ( req, res, next ) => {
	res.render( 'website/grand-derby-holdem-masters', {
		page_name: 'grand-derby-holdem-masters',
		page_title: 'Grand Derby Holdem Masters'
	});
};