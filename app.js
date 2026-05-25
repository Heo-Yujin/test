const API_URL = '/api/products';
let allProducts = []; // 수정 시 원본 데이터 참조용 전역 변수

// DOM Ready 상태일 때 실행
$(document).ready(function() {
    // 1. 초기 상품 목록 로드
    fetchProducts();

    // 2. [CREATE & UPDATE] 폼 제출(Submit) 이벤트 처리
    $('#productForm').on('submit', function(e) {
        e.preventDefault();

        const id = $('#productId').val();
        const payload = {
            name: $('#name').val(),
            price: parseInt($('#price').val()),
            description: $('#description').val()
        };

        let type = 'POST';
        let url = API_URL;

        // ID가 존재하면 수정(PUT) 모드로 전환
        if (id) {
            type = 'PUT';
            url = `${API_URL}/${id}`;
        }

        $.ajax({
            url: url,
            type: type,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(response) {
                resetForm();
                fetchProducts();
            },
            error: function(xhr) {
                const errData = xhr.responseJSON;
                alert('실패: ' + (errData ? errData.error : '알 수 없는 오류'));
            }
        });
    });

    // 3. 취소 버튼 클릭 이벤트 처리
    $('#cancelBtn').on('click', function() {
        resetForm();
    });
});

// [READ] 상품 목록 조회 및 동적 렌더링
function fetchProducts() {
    $.get(API_URL, function(data) {
        allProducts = data;
        const $tbody = $('#productTableBody');
        $tbody.empty(); // 기존 테이블 로우 삭제

        // jQuery 반복문 활용 동적 tr 생성
        $.each(allProducts, function(index, product) {
            const tr = `
                <tr>
                    <td>${product.id}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.price.toLocaleString()}원</td>
                    <td>${product.description || ''}</td>
                    <td>
                        <button class="btn-edit" data-id="${product.id}">수정</button>
                        <button class="btn-delete" data-id="${product.id}">삭제</button>
                    </td>
                </tr>
            `;
            $tbody.append(tr);
        });

        // 동적으로 생성된 버튼들에 이벤트 바인딩
        bindActionButtons();
    });
}

// 동적 버튼 이벤트 바인딩 함수
function bindActionButtons() {
    // 수정 버튼 클릭 시
    $('.btn-edit').off('click').on('click', function() {
        const id = $(this).data('id');
        const product = allProducts.find(p => p.id === id);
        if (!product) return;

        $('#productId').val(product.id);
        $('#name').val(product.name);
        $('#price').val(product.price);
        $('#description').val(product.description || '');

        $('#submitBtn').text('정정하기');
        $('#cancelBtn').show();
    });

    // [DELETE] 삭제 버튼 클릭 시
    $('.btn-delete').off('click').on('click', function() {
        const id = $(this).data('id');
        if (!confirm('정말 삭제하시겠습니까?')) return;

        $.ajax({
            url: `${API_URL}/${id}`,
            type: 'DELETE',
            success: function(response) {
                fetchProducts();
            },
            error: function() {
                alert('삭제에 실패했습니다.');
            }
        });
    });
}

// 입력 폼 초기화 함수
function resetForm() {
    $('#productId').val('');
    $('#productForm')[0].reset(); // jQuery 객체에서 순수 form element 꺼내어 reset
    $('#submitBtn').text('상품 등록');
    $('#cancelBtn').hide();
}