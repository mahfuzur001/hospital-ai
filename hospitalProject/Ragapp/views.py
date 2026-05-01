from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .rag_services import RAGService


class ChatWithDoctorAIView(APIView):

    def post(self, request):
        query = request.data.get("query") or request.data.get("message")

        if not query:
            return Response(
                {"error": "Query is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            result = RAGService.ask_ai(query)
            return Response({"response": result})
        except Exception as e:
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RebuildEmbeddingsView(APIView):

    def post(self, request):
        try:
            msg = RAGService.generate_embeddings_for_all_doctors()
            return Response({"message": msg})
        except Exception as e:
            return Response({"error": str(e)}, status=500)