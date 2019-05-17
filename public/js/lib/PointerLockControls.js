/**
 * Used to let the camera fly around the scene.
 */
class PointerLockControls {

	/**
	 * 
	 * @param {THREE.PerspectiveCamera} camera 
	 */
	constructor ( camera ) {

		var scope = this;

		var pitchObject = new THREE.Object3D();
		pitchObject.add( camera );

		var yawObject = new THREE.Object3D();
		yawObject.position.y = 10;
		yawObject.add( pitchObject );

		var moveForward = false;
		var moveBackward = false;
		var moveLeft = false;
		var moveRight = false;
		var moveDown = false;
		var moveUp = false;

		var isOnObject = false;

		var velocity = new THREE.Vector3();

		var PI_2 = Math.PI / 2;

		var onMouseMove = function ( event ) {

			if ( scope.enabled === false ) return;

			var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
			var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

			// fixes a bug causing the camera to rotate when the window is resized occasionally
			// may 14 2017
			if (Math.abs(movementX) < 300 && Math.abs(movementY) < 300) {
				yawObject.rotation.y -= movementX * 0.002;
				pitchObject.rotation.x -= movementY * 0.002;
			}

			pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

		};

		var onKeyDown = function ( event ) {

			switch ( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = true;
					break;

				case 37: // left
				case 65: // a
					moveLeft = true;
					break;

				case 40: // down
				case 83: // s
					moveBackward = true;
					break;

				case 39: // right
				case 68: // d
					moveRight = true;
					break;


				case 16: // shift
					moveDown = true;
					break;


				case 32: // space
					moveUp = true;
					break;

			}

		};

		var onKeyUp = function ( event ) {

			switch( event.keyCode ) {

				case 38: // up
				case 87: // w
					moveForward = false;
					break;

				case 37: // left
				case 65: // a
					moveLeft = false;
					break;

				case 40: // down
				case 83: // a
					moveBackward = false;
					break;

				case 39: // right
				case 68: // d
					moveRight = false;
					break;

				case 16: // shift
					moveDown = false;
					break;

				case 32: // space
					moveUp = false;
					break;

			}

		};

		document.addEventListener( 'mousemove', onMouseMove, {capture: false, passive: false} );
		document.addEventListener( 'keydown', onKeyDown, false );
		document.addEventListener( 'keyup', onKeyUp, false );

		this.enabled = false;

		this.getObject = function () {

			return yawObject;

		};

		this.update = function ( delta ) {

			if ( scope.enabled === false ) return;

			delta *= 0.1;

			velocity.x += ( - velocity.x ) * 0.08 * delta;
			velocity.z += ( - velocity.z ) * 0.08 * delta;
			velocity.y += ( - velocity.y ) * 0.08 * delta;

			var speed = 2;

			if ( moveForward ) velocity.z -= speed * delta;
			if ( moveBackward ) velocity.z += speed * delta;

			if ( moveLeft ) velocity.x -= speed * delta;
			if ( moveRight ) velocity.x += speed * delta;

			if ( moveDown ) velocity.y -= speed * delta;
			if ( moveUp ) velocity.y += speed * delta;

			yawObject.translateX( velocity.x );
			yawObject.translateY( velocity.y );
			yawObject.translateZ( velocity.z );

		};

	}

}
