from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField
from django.db.models.signals import pre_delete
from django.dispatch import receiver
import cloudinary


class IngredientAnalysis(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=100)
    image = CloudinaryField('image', blank=True, null=True)
    result = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - {self.category} - {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


@receiver(pre_delete, sender=IngredientAnalysis)
def delete_cloudinary_image(sender, instance, **kwargs):
    if instance.image:
        cloudinary.uploader.destroy(instance.image.public_id)
