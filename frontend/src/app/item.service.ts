import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface Item {
  item_id: number;
  item_title: string;
  description: string;
  item_amount: number;
  quantity: number;
  seller_id: number;
  seller_name: string;
  category_id: number;
}

export interface Category {
  category_id: number;
  category_name: string;
}

export interface Review {
  review_id: number;
  item_id: number;
  reviewer_id: number;
  reviewer_name: string;
  rating: number;
  comment: string;
  review_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(private http: HttpClient) { }

  loadItems(): Observable<Item[]> {
    return this.http.get<Item[]>('/api/item').pipe(
      catchError((error) => {
        console.error('Error loading items:', error);
        return throwError(() => error);
      })
    );
  }

  loadUserItems(userId: number): Observable<Item[]> {
    return this.http.get<Item[]>(`/api/item/user/${userId}`).pipe(
      catchError((error) => {
        console.error('Error loading items:', error);
        return throwError(() => error);
      })
    );
  }

  loadCategories(): Observable<Category[]> {
    return this.http.get<Category[]>('/api/category').pipe(
      catchError((error) => {
        console.error('Error loading categories:', error);
        return throwError(() => error);
      })
    );
  }

  searchItems(query: string, categoryId?: number): Observable<Item[]> {
    let params: any = { query };
    if (categoryId) {
      params.category_id = categoryId;
    }
    return this.http.get<Item[]>('/api/item/search', { params }).pipe(
      catchError((error) => {
        console.error('Error loading items:', error);
        return throwError(() => error);
      })
    );
  }

  searchUserItems(userId: number, query: string, categoryId?: number): Observable<Item[]> {
    let url = `/api/item/user/${userId}/search?query=${query}`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }
    return this.http.get<Item[]>(url).pipe(
      catchError((error) => {
        console.error('Error loading items:', error);
        return throwError(() => error);
      })
    );
  }

  getItem(itemId: number): Observable<Item> {
    return this.http.get<Item>(`/api/item/${itemId}`).pipe(
      catchError((error) => {
        console.error('Error getting item:', error);
        return throwError(() => error);
      })
    );
  }

  buyItem(itemId: number, buyerId: number): Observable<any> {
    return this.http.post<any>('/api/transaction/create', { itemId, buyerId }).pipe(
      catchError((error) => {
        console.error('Error processing purchase:', error);
        return throwError(() => error);
      })
    );
  }

  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>('/api/item/create', item).pipe(
      catchError((error) => {
        console.error('Error creating item:', error);
        return throwError(() => error);
      })
    );
  }

  updateItem(item: Item): Observable<Item> {
    return this.http.patch<Item>(`api/item/${item.item_id}`, item).pipe(
      catchError((error) => {
        console.error('Error updating item:', error);
        return throwError(() => error);
      })
    );
  }

  deleteItem(item: Item): Observable<Item> {
    return this.http.delete<Item>(`api/item/${item.item_id}`).pipe(
      catchError((error) => {
        console.error('Error deleting item:', error);
        return throwError(() => error);
      })
    );
  }

  getReviews(itemId: number): Observable<Review[]> {
    return this.http.get<Review[]>(`/api/review/${itemId}`).pipe(
      catchError((error) => {
        console.error('Error loading reviews:', error);
        return throwError(() => error);
      })
    );
  }

  submitReview(item_id: number, reviewer_id: number, comment: string, rating: number): Observable<Review> {
    const reviewData = { item_id, reviewer_id, comment, rating };
    return this.http.post<Review>('/api/review/create', reviewData).pipe(
      catchError((error) => {
        console.error('Error submitting review:', error);
        return throwError(() => error);
      })
    );
  }
}
