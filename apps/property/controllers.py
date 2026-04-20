from flask import render_template, redirect, url_for, flash, request, current_app, abort, jsonify
from flask_login import login_required, current_user
from .utils import save_property_images
from ..models.property import Property
from ..models.property_image import PropertyImage
from ..models.favorite import Favorite
from .. import db
from .forms import PropertyForm
from flask_babel import _
from . import property
from .utils import allowed_file, delete_property_image

@property.route('/add_property', methods=['GET', 'POST'])
@login_required
def add_property():
    form = PropertyForm()
    if form.validate_on_submit():
        try:
            images = [img for img in request.files.getlist('images') if img and img.filename]

            if len(images) < 3:
                flash(_('Veuillez ajouter au moins 3 images'), 'danger')
                return render_template('properties/add_property.html', form=form)

            for image in images:
                if not allowed_file(image.filename):
                    flash(_('Type de fichier non supporté. Utilisez JPG, PNG ou WEBP.'), 'danger')
                    return render_template('properties/add_property.html', form=form)
                image.seek(0, 2)
                size = image.tell()
                image.seek(0)
                if size > current_app.config['MAX_IMAGE_SIZE']:
                    flash(_('Une des images dépasse 5 MB'), 'danger')
                    return render_template('properties/add_property.html', form=form)

            # Upload images before touching the DB so a Firebase failure leaves no orphan records
            image_urls = save_property_images(images, folder_name=f"property_images/{current_user.id}")
            if not image_urls:
                flash(_('Impossible d\'enregistrer les images, réessayez.'), 'danger')
                return render_template('properties/add_property.html', form=form)

            new_property = Property(
                title=form.title.data,
                description=form.description.data,
                neighborhood=form.neighborhood.data,
                property_type=form.property_type.data,
                rooms=form.rooms.data,
                bathrooms=form.bathrooms.data,
                country=form.country.data,
                shower_type=form.shower_type.data,
                transaction_type=form.transaction_type.data,
                surface=form.surface.data,
                has_courtyard=form.has_courtyard.data,
                has_water=form.has_water.data,
                has_electricity=form.has_electricity.data,
                exact_address=form.exact_address.data,
                whatsapp_contact=form.whatsapp_contact.data,
                phone_contact=form.phone_contact.data,
                price=form.price.data,
                currency=form.currency.data,
                owner_id=current_user.id
            )

            db.session.add(new_property)
            db.session.flush()  # get new_property.id without committing

            for url in image_urls:
                db.session.add(PropertyImage(filename=url, property_id=new_property.id))

            db.session.commit()
            flash(_('Votre propriété a été ajoutée!'), 'success')
            return redirect(url_for('property.detail', property_id=new_property.id))

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error adding property: {str(e)}", exc_info=True)
            flash(_('Une erreur est survenue lors de l\'ajout de la propriété'), 'danger')

    return render_template(
        'properties/add_property.html',
        form=form,
        title=_('Ajouter une propriété')
    )


@property.route('/edit_property/<int:property_id>', methods=['GET', 'POST'])
@login_required
def edit_property(property_id):
    prop = Property.query.get_or_404(property_id)

    if prop.owner_id != current_user.id:
        abort(403)

    form = PropertyForm(obj=prop)

    if form.validate_on_submit():
        try:
            prop.title = form.title.data
            prop.description = form.description.data
            prop.neighborhood = form.neighborhood.data
            prop.property_type = form.property_type.data
            prop.rooms = form.rooms.data
            prop.bathrooms = form.bathrooms.data
            prop.country = form.country.data
            prop.shower_type = form.shower_type.data
            prop.transaction_type = form.transaction_type.data
            prop.surface = form.surface.data
            prop.has_courtyard = form.has_courtyard.data
            prop.has_water = form.has_water.data
            prop.has_electricity = form.has_electricity.data
            prop.exact_address = form.exact_address.data
            prop.whatsapp_contact = form.whatsapp_contact.data
            prop.phone_contact = form.phone_contact.data
            prop.price = form.price.data
            prop.currency = form.currency.data
            prop.is_available = form.is_available.data if hasattr(form, 'is_available') else True

            images = [img for img in request.files.getlist('images') if img and img.filename]
            if images:
                for image in images:
                    if not allowed_file(image.filename):
                        flash(_('Type de fichier non supporté.'), 'danger')
                        return render_template('properties/edit_property.html', form=form, property=prop)
                    image.seek(0, 2)
                    size = image.tell()
                    image.seek(0)
                    if size > current_app.config['MAX_IMAGE_SIZE']:
                        flash(_('Une des images dépasse 5 MB'), 'danger')
                        return render_template('properties/edit_property.html', form=form, property=prop)

                for img in prop.images:
                    delete_property_image(img.filename)
                    db.session.delete(img)

                image_urls = save_property_images(images, folder_name=f"property_images/{current_user.id}")
                for url in image_urls:
                    db.session.add(PropertyImage(filename=url, property_id=prop.id))

            db.session.commit()
            flash(_('Les modifications ont été enregistrées!'), 'success')
            return redirect(url_for('property.detail', property_id=prop.id))

        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error editing property: {str(e)}", exc_info=True)
            flash(_('Une erreur est survenue lors de la modification'), 'danger')

    return render_template(
        'properties/edit_property.html',
        form=form,
        property=prop,
        title=_('Modifier la propriété')
    )


@property.route('/delete_image/<int:image_id>', methods=['POST'])
@login_required
def delete_image(image_id):
    image = PropertyImage.query.get_or_404(image_id)
    prop = image.property

    if prop.owner_id != current_user.id:
        abort(403)

    try:
        delete_property_image(image.filename)
        db.session.delete(image)
        db.session.commit()
        flash(_('Image supprimée avec succès'), 'success')
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting image: {str(e)}", exc_info=True)
        flash(_('Une erreur est survenue lors de la suppression'), 'danger')

    return redirect(url_for('property.edit_property', property_id=prop.id))


@property.route('view_property/<int:property_id>', methods=['GET'])
def detail(property_id):
    prop = Property.query.get_or_404(property_id)
    return render_template(
        'properties/detail.html',
        title=prop.title,
        property=prop
    )


@property.route('/delete_property/<int:property_id>', methods=['POST'])
@login_required
def delete_property(property_id):
    prop = Property.query.get_or_404(property_id)

    if prop.owner_id != current_user.id:
        abort(403)

    try:
        for image in prop.images:
            delete_property_image(image.filename)

        db.session.delete(prop)
        db.session.commit()

        flash(_('La propriété a été supprimée avec succès'), 'success')
        return redirect(url_for('main.home'))

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting property: {str(e)}", exc_info=True)
        flash(_('Une erreur est survenue lors de la suppression'), 'danger')
        return redirect(url_for('property.detail', property_id=prop.id))


@property.route('/toggle_favorite/<int:property_id>', methods=['POST'])
@login_required
def toggle_favorite(property_id):
    prop = Property.query.get_or_404(property_id)
    favorite = Favorite.query.filter_by(
        user_id=current_user.id,
        property_id=prop.id
    ).first()

    try:
        if favorite:
            db.session.delete(favorite)
            is_favorite = False
        else:
            favorite = Favorite(user_id=current_user.id, property_id=prop.id)
            db.session.add(favorite)
            is_favorite = True

        db.session.commit()
        return jsonify({
            'success': True,
            'is_favorite': is_favorite,
            'favorites_count': len(prop.favorites)
        })
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error toggling favorite: {str(e)}", exc_info=True)
        return jsonify({'success': False}), 500
