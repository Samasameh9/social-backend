export interface IPaginate<T>{
     docs:T[];
      pages:number;
      count:number;
      limit:number;
      currentPage:number;
}