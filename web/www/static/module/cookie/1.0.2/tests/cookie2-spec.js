define('module/cookie/1.0.2/tests/cookie2-spec', ['{{module}}'], function(Cookie) {
	describe('Cookie Test2', function() {
		describe('remove', function() {

			it('should remove a cookie from the machine.', function() {

				Cookie.set('_sea_test_21', 'xx');
				Cookie.remove('_sea_test_21');
				expect(Cookie.get('_sea_test_21')).to.equal(undefined);

				Cookie.set('_sea_test_22', 'xx', {
					expires: new Date(2099, 1, 1),
					path: '/'
				});
				Cookie.remove('_sea_test_22', {
					path: '/'
				});
				expect(Cookie.get('_sea_test_22')).to.equal(undefined);

			});
		});

	});
});