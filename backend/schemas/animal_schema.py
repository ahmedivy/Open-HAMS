from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, auto_field
from models.animal import Animal

class AnimalSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Animal
        load_instance = True
        sqla_session = db.session

    id = auto_field()
    name = auto_field()
    kind = auto_field()
    species = auto_field()
    image = auto_field()
    max_daily_checkouts = auto_field()  # only set by admin & mod for animal saftey
    max_checkout_hours = auto_field()   # only set by admin & mod for animal saftey
    rest_time = auto_field()        # set by admin/mod will be the mandatory time to rest after an event
    description = auto_field()
    checked_in = auto_field()
    handling_enabled = auto_field()    # admin/mod only for special situations so noone can checkout the animal
    created_at = auto_field(dump_only=True)
    updated_at = auto_field(dump_only=True)
    zoo_id = auto_field()

    # Optional: Nested relationships, uncomment if needed
        # regarding animal_events, it may be good to see if an animal event is true and click to view the event  
    # animal_events = ma.Nested('AnimalEventSchema', many=True, exclude=('animal',))
        # regarding animal_comments each animal should have it's only profile page and view comments/log there. same goes for the relationships below here 
    # animal_comments = ma.Nested('AnimalCommentSchema', many=True, exclude=('animal',))
    # audits = ma.Nested('AnimalAuditSchema', many=True, exclude=('animal',))
    # health_logs = ma.Nested('AnimalHealthLogSchema', many=True, exclude=('animal',))
    # activity_logs = ma.Nested('AnimalActivityLogSchema', many=True, exclude=('animal',))
